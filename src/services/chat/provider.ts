import type { ResponseProvider, ChatCompletion } from "@opentiny/tiny-robot-kit";
import { skillContext } from "../extensions.js";
import { ApiError, streamMessage } from "../api/client.js";
import type { ChatModel, CreateMessageRequest } from "../api/types.js";
import { extractFileIds, getFileErrorCode, isRetryableApiError } from "../api/errors.js";
import { cancelUpload, describeUploadError, uploadAttachment, useUploads } from "../attachments.js";
import { useSettings } from "../settings.js";
import * as db from "./db.js";
import { createLatestReminder } from "./latestReminder.js";
import { applyEvent, getContextRounds, settleReply, toRequestMessages } from "./reply.js";
import type { AssistantMessage, FileAttachment, Message, Session, UserMessage } from "./types.js";
export type Request = { history: Message[]; question: UserMessage; prefix?: AssistantMessage };
export const MODEL: ChatModel = "deepseek-flash";
const SYSTEM_PROMPT = "该助手为DeepSeek，由深度求索公司创造。";
const SAFETY_CHECK = { level: "high" } as const;
const FILE_RETRY_LIMIT = 2;
const FILE_RETRY_BASE_DELAY = 1000;
const serverTools = (search: boolean): CreateMessageRequest["tools"] => {
  const tools: CreateMessageRequest["tools"] = [
    { type: "deepseek_read_url", name: "deepseek_read_url" },
  ];
  if (search) {
    tools.push({ type: "deepseek_web_search", name: "deepseek_web_search" });
  }
  return tools;
};

/** DeepSeek-only protocol/attachment adapter. Kit owns request lifecycle and cancellation. */
export function createDeepSeekProvider({
  getSession,
  updateSession,
  persist,
  getEpoch,
  locked,
  wantsTitle,
  cancelTitle,
}: {
  getSession: (id: string) => Session | undefined;
  updateSession: (id: string, update: (session: Session) => Session) => void;
  persist: (id: string) => void;
  getEpoch: () => number;
  locked: () => boolean;
  wantsTitle: () => boolean;
  cancelTitle: () => void;
}) {
  /** 把补传得到的 serverId 写回会话里所有引用同一附件的消息（编辑、重新生成会共用附件） */
  const saveServerIds = (sessionId: string, serverIds: Map<string, string>) => {
    if (serverIds.size === 0) {
      return;
    }
    updateSession(sessionId, (session) => ({
      ...session,
      messages: session.messages.map((message) =>
        message.role === "user" && message.files.some((file) => serverIds.has(file.id))
          ? {
              ...message,
              files: message.files.map((file) =>
                serverIds.has(file.id)
                  ? { ...file, serverId: serverIds.get(file.id) ?? null }
                  : file,
              ),
            }
          : message,
      ),
    }));
    persist(sessionId);
  };

  /**
   * 附件的服务端 id：已有直接用；正在上传的等待同一任务；否则读取本地原件补传。
   * 本地也没有原件（导入的文档附件只有元数据）时返回 null，该附件只展示、不进入请求。
   */
  const ensureServerId = async (apiKey: string, file: FileAttachment): Promise<string | null> => {
    if (file.serverId) {
      return file.serverId;
    }
    const task = useUploads.getState().tasks[file.id];
    if (task?.status === "done") {
      return task.serverId;
    }
    const blob = await db.loadFile(file.id);
    if (!blob) {
      return null;
    }
    return uploadAttachment(apiKey, file.id, blob, file.name, file.isImage);
  };

  /** 用会话里的最新消息替换请求快照：重传前会重置附件的 serverId，快照必须跟着更新 */
  const refreshRequest = (sessionId: string, request: Request): Request => {
    const session = getSession(sessionId);
    if (!session) {
      return request;
    }
    const byId = new Map(session.messages.map((message) => [message.id, message]));
    const pick = <T extends Message>(message: T): T =>
      (byId.get(message.id) as T | undefined) ?? message;
    return {
      history: request.history.map(pick),
      question: pick(request.question),
      prefix: request.prefix,
    };
  };

  /**
   * 发送前补齐附件的 serverId。
   * - 本轮提问的附件并行补齐，任一失败则整体失败，已成功的照常写回，重试时复用成功结果；
   * - 历史轮次（仅进入上下文的）中没有 serverId 的附件，多为导入的图片：从最新的消息往前逐张补传，
   *   失败静默跳过，该附件不进入本次请求，下次发送时再试。
   */
  const prepareFiles = async (sessionId: string, request: Request, signal: AbortSignal) => {
    const epoch = getEpoch();
    // 服务端判定 file_id 失效时会清掉会话里的 serverId，先用最新消息替换请求快照，
    // 否则快照里仍是旧 id，补传会直接复用它。
    request = refreshRequest(sessionId, request);
    const apiKey = useSettings.getState().apiKey ?? "";
    const serverIds = new Map<string, string>();
    // 停止生成立即生效；上传本身不取消（输入框与其他消息可能共用同一任务），完成后照常写回 serverId
    const aborted = new Promise<never>((_, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    });
    const uploads = Promise.allSettled(
      request.question.files.map(async (file) => {
        const serverId = await ensureServerId(apiKey, file);
        if (serverId) {
          serverIds.set(file.id, serverId);
        }
      }),
    );
    void uploads.then(() => {
      if (epoch === getEpoch()) {
        saveServerIds(sessionId, serverIds);
      }
    });
    const results = await Promise.race([uploads, aborted]);
    const failed = results.find((result) => result.status === "rejected");
    if (failed) {
      throw failed.reason;
    }

    const pending = new Map<string, FileAttachment>();
    for (const [user] of getContextRounds(request.history).toReversed()) {
      for (const file of user.files) {
        if (!file.serverId && !serverIds.has(file.id) && !pending.has(file.id)) {
          pending.set(file.id, file);
        }
      }
    }
    for (const file of pending.values()) {
      signal.throwIfAborted();
      try {
        const serverId = await Promise.race([ensureServerId(apiKey, file), aborted]);
        if (serverId) {
          serverIds.set(file.id, serverId);
          saveServerIds(sessionId, new Map([[file.id, serverId]]));
        }
      } catch {
        signal.throwIfAborted();
      }
    }

    // 用补齐后的会话重新取历史与提问，保证请求里都是 serverId
    const session = getSession(sessionId);
    const resolve = <T extends Message>(message: T): T =>
      (session?.messages.find((m) => m.id === message.id) as T | undefined) ?? message;
    return {
      history: request.history.map(resolve),
      question: resolve(request.question),
      prefix: request.prefix,
    };
  };

  /** 本次请求实际会用到的服务端 file_id */
  const collectServerFileIds = (request: Request): Set<string> => {
    const ids = new Set<string>();
    const add = (files: FileAttachment[]) => {
      for (const file of files) {
        if (file.serverId) {
          ids.add(file.serverId);
        }
      }
    };
    add(request.question.files);
    for (const [user] of getContextRounds(request.history)) {
      add(user.files);
    }
    return ids;
  };

  /**
   * 服务端判定 file_id 失效时，清掉对应附件的 serverId 并丢弃旧的上传任务，
   * 下一次补齐会重新读取本地原件上传。报错里点名了 file_id 就只重置这些，
   * 没点名（如 invalid file_id）则重置本次请求用到的全部附件。
   */
  const reuploadInvalidatedFiles = (
    sessionId: string,
    request: Request,
    error: unknown,
  ): boolean => {
    if (!(error instanceof ApiError) || !getFileErrorCode(error)) {
      return false;
    }
    const mentioned = extractFileIds(error.message);
    // 重试时原始快照里还是上一轮已被清掉的 serverId，先换成会话里的最新消息
    const targets =
      mentioned.length > 0
        ? new Set(mentioned)
        : collectServerFileIds(refreshRequest(sessionId, request));
    const session = getSession(sessionId);
    if (targets.size === 0 || !session) {
      return false;
    }
    const localIds: string[] = [];
    const messages = session.messages.map((message) => {
      if (message.role !== "user") {
        return message;
      }
      let changed = false;
      const files = message.files.map((file) => {
        if (!file.serverId || !targets.has(file.serverId)) {
          return file;
        }
        localIds.push(file.id);
        changed = true;
        return { ...file, serverId: null };
      });
      return changed ? { ...message, files } : message;
    });
    if (localIds.length === 0) {
      return false;
    }
    updateSession(sessionId, (current) => ({ ...current, messages }));
    // 上传任务里可能还留着同一个失效的 serverId，清掉后 ensureServerId 才会重新上传
    localIds.forEach(cancelUpload);
    persist(sessionId);
    return true;
  };

  /** 重传前的退避等待；停止生成时立即返回，由调用方按已停止收尾 */
  const waitForRetry = (attempt: number, signal: AbortSignal) =>
    new Promise<void>((resolve) => {
      function onAbort() {
        clearTimeout(timer);
        resolve();
      }
      const timer = setTimeout(
        () => {
          signal.removeEventListener("abort", onAbort);
          resolve();
        },
        FILE_RETRY_BASE_DELAY * 2 ** attempt,
      );
      signal.addEventListener("abort", onAbort, { once: true });
    });

  return (sessionId: string, initial: AssistantMessage, request: Request): ResponseProvider =>
    async function* (_, signal) {
      let reply = initial;
      const chunk = (message: AssistantMessage): ChatCompletion => ({
        id: message.id,
        object: "chat.completion.chunk",
        created: message.createdAt / 1000,
        model: MODEL,
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: undefined,
            delta: { deepseek: message },
            logprobs: null,
            finish_reason: null,
          },
        ],
      });
      yield chunk(reply);
      for (let attempt = 0; ; attempt += 1) {
        /** 附件补齐前出错属于上传失败，请求还没有发出 */
        let preparing = true;
        let receivedContent = false;
        try {
          const prepared = await prepareFiles(sessionId, request, signal);
          preparing = false;
          // 附件就绪后获取本轮信息；续写沿用原回答快照，重新生成的快照独立保存。
          const latestReminder = prepared.prefix
            ? prepared.prefix.latestReminder
            : createLatestReminder(useSettings.getState());
          reply = { ...reply, latestReminder };
          yield chunk(reply);
          const messages = toRequestMessages(
            prepared.history,
            prepared.question,
            prepared.prefix,
            initial.thinking ?? false,
            latestReminder,
          );
          const events = streamMessage(
            useSettings.getState().apiKey ?? "",
            {
              model: initial.model ?? MODEL,
              system: SYSTEM_PROMPT + skillContext(),
              messages,
              thinking: { type: initial.thinking ? "enabled" : "disabled" },
              safety_check: SAFETY_CHECK,
              tools: serverTools(initial.search ?? false),
              ...(wantsTitle() ? { title: { enabled: true } } : {}),
            },
            signal,
          );
          const blockIndexes = new Map<number, number>();
          for await (const event of events) {
            receivedContent ||= event.type === "content_block_start";
            if (
              event.type === "message_delta" &&
              (event.delta.stop_reason === "end_turn" ||
                event.delta.stop_reason === "max_tokens") &&
              event.delta.title?.trim() &&
              wantsTitle() &&
              !signal.aborted &&
              !locked()
            ) {
              const title = event.delta.title.trim();
              updateSession(sessionId, (session) =>
                session.title ? session : { ...session, title },
              );
              cancelTitle();
            }
            reply = applyEvent(reply, event, Date.now(), blockIndexes);
            signal.throwIfAborted();
            yield chunk(reply);
          }
          reply = settleReply(reply, "done", Date.now());
          break;
        } catch (error) {
          if (signal.aborted) {
            reply = settleReply(reply, "stopped", Date.now());
            break;
          }
          if (preparing) {
            reply = settleReply(reply, "error", Date.now(), {
              kind: "upload",
              message: "",
              localMessage: describeUploadError(error),
              retryable: isRetryableApiError(error),
            });
            break;
          }
          // 附件失效：重新补传后重发。收到过内容块（含丢弃的客户端工具）后不自动重发。
          if (
            attempt < FILE_RETRY_LIMIT &&
            !receivedContent &&
            reuploadInvalidatedFiles(sessionId, request, error)
          ) {
            await waitForRetry(attempt, signal);
            if (signal.aborted) {
              reply = settleReply(reply, "stopped", Date.now());
              break;
            }
            continue;
          }
          if (error instanceof ApiError && error.kind === "interrupted" && reply.stopReason) {
            // 已收到 message_delta 的结束原因，只是缺了结尾的 message_stop
            reply = settleReply(reply, "done", Date.now());
          } else if (error instanceof ApiError) {
            reply = settleReply(reply, "error", Date.now(), {
              kind: error.kind,
              message: error.message,
              status: error.status,
              localMessage: error.localMessage,
            });
          } else {
            reply = settleReply(reply, "error", Date.now(), {
              kind: "protocol",
              message: error instanceof Error ? error.message : String(error),
            });
          }
          break;
        }
      }
      yield chunk(reply);
    };
}
