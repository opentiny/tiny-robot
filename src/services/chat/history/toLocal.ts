import type {
  ServerToolUseBlock,
  WebFetchResult,
  WebFetchToolResultBlock,
} from "../../api/types.js";
import type {
  AssistantMessage,
  FileAttachment,
  Message,
  ReplyBlock,
  ReplyStatus,
  Session,
  UserMessage,
} from "../types.js";
import { fail } from "./errors.js";
import type { ChatMessage, FileEntry, Fragment, SessionFile } from "./format.js";
import { sessionFilesDir } from "./paths.js";

export type LocalSession = {
  session: Session;
  /** 本会话目录下应存在的图片：ZIP 条目名 → 文件 ID */
  images: Map<string, string>;
};

const time = (value: string) => Date.parse(value);

/** 链接会渲染成 href，只接受 HTTP / HTTPS。 */
const isWebUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const toFile = (file: FileEntry): FileAttachment => ({
  id: file.id,
  serverId: null,
  name: file.file_name,
  size: file.file_size,
  isImage: file.is_image,
  // 图片身份来自归档；原件随后从 ZIP 读取后补充具体 MIME。
  mimeType: "",
});

const toUser = (message: ChatMessage): UserMessage => ({
  id: String(message.id),
  role: "user",
  createdAt: time(message.inserted_at),
  content: message.fragments.map((item) => (item.type === "REQUEST" ? item.content : "")).join(""),
  files: message.fragments.flatMap((item) => (item.type === "FILE" ? item.files.map(toFile) : [])),
});

/** 归档不带原调用 ID，以消息和片段位置生成稳定 ID，调用与结果共用。 */
const toolBlocks = (
  id: string,
  input: ServerToolUseBlock["input"],
  kind: ServerToolUseBlock["kind"],
  result?: ReplyBlock,
): ReplyBlock[] => [
  {
    type: "server_tool_use",
    id,
    name: kind === "read_link" ? "deepseek_read_url" : "deepseek_web_search",
    input,
    kind,
    caller: { type: "direct" },
  },
  ...(result ? [result] : []),
];

const fetchResult = (
  toolUseId: string,
  content: WebFetchToolResultBlock["content"],
): WebFetchToolResultBlock => ({
  type: "web_fetch_tool_result",
  tool_use_id: toolUseId,
  kind: "deep_search",
  content,
});

const fetched = (
  url: string,
  title: string | null,
  publishedAt: string | null,
): WebFetchResult => ({
  type: "web_fetch_result",
  url,
  content: {
    type: "document",
    source: { type: "text", media_type: "text/plain", data: "" },
    title,
  },
  published_at: publishedAt,
});

const unavailable: WebFetchToolResultBlock["content"] = {
  type: "web_fetch_tool_result_error",
  error_code: "unavailable",
};

/**
 * 片段一次性转换为正式内容块，展示、请求和导出共用：
 * - 普通搜索与边想边搜共用 TOOL_SEARCH，以同一回复是否有打开 / 查找网页来区分；
 * - READ_LINK 将 URL、标题和签名存入工具结果；仅含签名的结果也保留；
 * - 没有链接的 TOOL_OPEN 不展示；
 * - 没有对应展示的片段直接丢弃。
 */
const toBlocks = (fragments: Fragment[], messageId: string): ReplyBlock[] => {
  const searchKind = fragments.some(
    (item) => item.type === "TOOL_OPEN" || item.type === "TOOL_FIND",
  )
    ? "deep_search"
    : "search";
  return fragments.flatMap((item, index): ReplyBlock[] => {
    const id = `history-${messageId}-${index}`;
    switch (item.type) {
      case "RESPONSE":
        return [{ type: "text", text: item.content }];
      case "TEMPLATE_RESPONSE":
        return [{ type: "text", text: item.content, isTemplate: true }];
      case "THINK":
        return [
          {
            type: "thinking",
            thinking: item.content,
            ...(item.elapsed_secs === null ? {} : { elapsedSeconds: item.elapsed_secs }),
          },
        ];
      case "TOOL_SEARCH":
        return toolBlocks(
          id,
          { action: "search", query: item.queries[0] ?? "", queries: item.queries },
          searchKind,
          item.status === "WIP"
            ? undefined
            : {
                type: "web_search_tool_result",
                tool_use_id: id,
                kind: searchKind,
                content:
                  item.status === "FAILED"
                    ? [{ type: "web_search_tool_result_error", error_code: "unavailable" }]
                    : item.results
                        .filter((result) => isWebUrl(result.url))
                        .map((result) => ({
                          type: "web_search_result",
                          url: result.url,
                          title: result.title,
                          snippet: result.snippet,
                          site_icon:
                            result.site_icon && isWebUrl(result.site_icon)
                              ? result.site_icon
                              : null,
                          site_name: result.site_name,
                          page_age: result.published_at,
                          encrypted_content: "",
                        })),
              },
        );
      case "TOOL_OPEN":
        if (!item.url || !isWebUrl(item.url)) {
          return [];
        }
        return toolBlocks(
          id,
          { action: "open_page", url: item.url },
          "deep_search",
          item.status === "WIP"
            ? undefined
            : fetchResult(
                id,
                item.status === "FINISHED"
                  ? fetched(item.url, item.title, item.published_at)
                  : unavailable,
              ),
        );
      case "TOOL_FIND":
        return toolBlocks(
          id,
          { action: "find_in_page", url: "", pattern: item.pattern ?? "" },
          "deep_search",
          item.status === "WIP"
            ? undefined
            : fetchResult(id, item.status === "FINISHED" ? fetched("", null, null) : unavailable),
        );
      case "READ_LINK":
        return item.results.flatMap((result, resultIndex) => {
          const url = result.url && isWebUrl(result.url) ? result.url : "";
          if (!url && !result.signature.trim()) {
            return [];
          }
          const toolId = `${id}-${resultIndex}`;
          return toolBlocks(toolId, { action: "read_link", url }, "read_link", {
            type: "web_fetch_tool_result",
            tool_use_id: toolId,
            kind: "read_link",
            content: fetched(url, result.title ?? null, null),
            signature: result.signature,
          });
        });
      default:
        return [];
    }
  });
};

/** 统一为正式回复状态：失败不进入上下文，未完成的按已停止处理。 */
const replyStatus: Record<ChatMessage["status"], ReplyStatus> = {
  FINISHED: "done",
  CONTENT_FILTER: "done",
  FAILED: "error",
  CONTEXT_LENGTH_EXCEEDED: "error",
  INCOMPLETE: "stopped",
  TIMEOUT: "error",
  WIP: "stopped",
};

const toAssistant = (message: ChatMessage): AssistantMessage => {
  const id = String(message.id);
  const blocks = toBlocks(message.fragments, id);
  const refused = message.status === "CONTENT_FILTER";
  return {
    id,
    role: "assistant",
    createdAt: time(message.inserted_at),
    model: null,
    thinking: message.thinking_enabled,
    search: message.search_enabled,
    prefix: false,
    status: replyStatus[message.status],
    // 拒绝回复丢弃模型正文和思考，保留模板提示与工具步骤。
    ...(refused ? { stopReason: "refusal" as const } : {}),
    blocks: refused
      ? blocks.filter(
          (block) => block.type !== "thinking" && (block.type !== "text" || block.isTemplate),
        )
      : blocks,
  };
};

/**
 * 按 id 排序还原消息树：父消息的 id 必须更小、角色交替、根为提问。
 * current_message_id 到根的路径为当前分支；其余节点默认选中 id 最大的子消息。
 */
const buildTree = (file: SessionFile): Pick<Session, "messages" | "rootMessageId"> => {
  const sorted = file.messages.toSorted((a, b) => a.id - b.id);
  const byId = new Map<number, Message>();
  const messages = sorted.map((message) => {
    const { id, parent_id } = message;
    const parent = parent_id === null ? undefined : byId.get(parent_id);
    if (
      byId.has(id) ||
      (parent_id === null ? message.role !== "USER" : !parent) ||
      (parent && parent.role === (message.role === "USER" ? "user" : "assistant"))
    ) {
      fail("backupInvalidBranches");
    }
    const local = message.role === "USER" ? toUser(message) : toAssistant(message);
    local.parentId = parent ? parent.id : null;
    if (parent) {
      parent.selectedChildId = local.id;
    }
    byId.set(id, local);
    return local;
  });
  if (messages.length === 0) {
    return { messages, rootMessageId: null };
  }
  let current = byId.get(file.current_message_id) ?? fail("backupInvalidBranches");
  // 当前消息就是用户停留的位置，后面即使还有消息也不继续展开。
  current.selectedChildId = undefined;
  while (current.parentId) {
    const parent = byId.get(Number(current.parentId)) ?? fail("backupInvalidBranches");
    parent.selectedChildId = current.id;
    current = parent;
  }
  return { messages, rootMessageId: current.id };
};

/** 转换单个会话，并列出本会话目录下需要从 ZIP 读取的图片。 */
export const toLocalSession = (file: SessionFile): LocalSession => {
  const session: Session = {
    id: file.id,
    // 空标题按「新对话」显示，导出时还原为 null。
    title: file.title ?? "",
    createdAt: time(file.inserted_at),
    updatedAt: time(file.updated_at),
    ...buildTree(file),
  };
  const images = new Map<string, string>();
  for (const message of file.messages) {
    for (const item of message.fragments) {
      if (item.type !== "FILE") {
        continue;
      }
      for (const entry of item.files) {
        if (!entry.is_image) {
          continue;
        }
        // 读取端把条目名规范为 NFC，引用也按同样规则比较。
        const path = entry.export_path?.normalize("NFC");
        if (path === undefined) {
          continue;
        }
        // 图片只能在本会话目录下，同一条目不能对应不同文件。
        if (
          !path.startsWith(sessionFilesDir(file.id)) ||
          (images.get(path) ?? entry.id) !== entry.id
        ) {
          fail("backupInvalidFiles");
        }
        images.set(path, entry.id);
      }
    }
  }
  return { session, images };
};
