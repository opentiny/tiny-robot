import { computed, shallowReactive, ref } from "vue";
import {
  useConversation,
  type ChatMessage,
  type ConversationInfo,
  type UseMessageReturn,
} from "@opentiny/tiny-robot-kit";
import { useChatRuntimeFromConversation } from "@opentiny/tiny-robot-chat";
import { createId } from "../../utils/id.js";
import { useUploads } from "../attachments.js";
import { useSettings } from "../settings.js";
import { appendBranch, getVisibleMessages, normalizeSession, selectVersion } from "./branches.js";
import * as db from "./db.js";
import {
  clearAllDrafts,
  clearDraft,
  clearSentDraft,
  getDraft,
  prepareDraftMessage,
} from "./drafts.js";
import { canContinueReply, settleReply } from "./reply.js";
import { createDeepSeekProvider, MODEL, type Request } from "./provider.js";
import {
  toSessionSummary,
  type AssistantMessage,
  type Message,
  type Session,
  type UserMessage,
} from "./types.js";

// Kit owns the list, engines, cancellation and persistence queue. This projection only
// exposes DeepSeek's branch tree to the renderer and the interoperable ZIP archive.
const ready = ref(false),
  initError = ref(false),
  importingHistory = ref(false);
const sessionLoadErrors = ref<Record<string, boolean>>({});
const sessionSaveErrors = ref<Record<string, boolean>>({});
const engines = shallowReactive(new Map<string, UseMessageReturn>());
const dirty = new Map<string, Session>();
const pendingFiles = new Map<string, db.StoredFile[]>();
const writeEpochs = new Map<string, number>();
const turns = new Map<string, Promise<void>>();
const titleRequests = new Set<string>();
const loadedSessions = new Map<string, Session>();
let navigationQueue = Promise.resolve();
let retryLoad: Promise<void> | undefined;
const deletions = new Map<string, Promise<boolean>>();
let historyEpoch = 0,
  navigation = 0,
  resetting = false;
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const wrap = (message: Message): ChatMessage => ({
  id: message.id,
  role: message.role,
  content: "",
  deepseek: message,
  historyEpoch,
});
const unwrap = (messages: ChatMessage[]) =>
  messages.flatMap((m) => (m.deepseek ? [m.deepseek as Message] : []));
const info = (id: string) => conversation.conversations.value.find((item) => item.id === id);
const sessionFrom = (item: ConversationInfo, messages: ChatMessage[]): Session => ({
  ...toSessionSummary({ ...item, title: item.title || "" }),
  rootMessageId: (item.metadata?.rootMessageId as string | null) ?? null,
  messages: unwrap(messages),
});
const getSession = (id: string) => {
  const item = info(id),
    engine = engines.get(id);
  return item && engine ? sessionFrom(item, engine.messages.value) : dirty.get(id);
};
const updateSession = (id: string, update: (session: Session) => Session) => {
  const current = getSession(id),
    item = info(id),
    engine = engines.get(id);
  if (!current || !item || !engine) return;
  const next = update(current);
  Object.assign(item, toSessionSummary(next), { metadata: { rootMessageId: next.rootMessageId } });
  const existing = new Map(engine.messages.value.map((message) => [message.id, message]));
  engine.messages.value = [
    ...next.messages.map((message) => {
      const current = existing.get(message.id);
      return current ? Object.assign(current, wrap(message)) : wrap(message);
    }),
    ...engine.messages.value.filter((message) => !message.deepseek),
  ];
};
async function save(session: Session) {
  if (importingHistory.value) return;
  const files = pendingFiles.get(session.id),
    epoch = historyEpoch;
  dirty.set(session.id, session);
  try {
    await db.saveSession(plain(session), files);
    if (epoch !== historyEpoch) return;
    if (pendingFiles.get(session.id) === files) pendingFiles.delete(session.id);
    if (dirty.get(session.id) === session) dirty.delete(session.id);
    delete sessionSaveErrors.value[session.id];
  } catch (error) {
    sessionSaveErrors.value[session.id] = true;
    db.reportStorageError("save session")(error);
  }
}
async function loadList() {
  const epoch = historyEpoch;
  try {
    const list = await db.loadSessionSummaries();
    if (epoch !== historyEpoch) return [];
    ready.value = true;
    initError.value = false;
    return list;
  } catch (error) {
    initError.value = true;
    db.reportStorageError("load conversations")(error);
    return [];
  }
}
export const conversation = useConversation({
  autoSaveMessages: true,
  autoSaveThrottle: 250,
  storage: {
    loadConversations: loadList,
    async loadMessages(id) {
      const stored = loadedSessions.get(id) ?? dirty.get(id);
      if (!stored) throw new Error("Conversation could not be loaded");
      const session = normalizeSession(stored);
      const item = info(id);
      if (item) item.metadata = { rootMessageId: session.rootMessageId };
      return session.messages.map((m) =>
        wrap(
          m.role === "assistant" && ["pending", "streaming"].includes(m.status)
            ? settleReply(m, "stopped", session.updatedAt)
            : m,
        ),
      );
    },
    async saveConversation(item) {
      writeEpochs.set(item.id, historyEpoch);
      if (importingHistory.value || item !== info(item.id)) return;
      try {
        await db.renameSession(item.id, item.title || "");
      } catch (error) {
        sessionSaveErrors.value[item.id] = true;
        db.reportStorageError("rename")(error);
      }
    },
    async saveMessages(id, messages) {
      // Kit may still hold a queued save for an engine it has already evicted.
      // Old engine snapshots must never overwrite a newly imported same-ID archive.
      if (
        writeEpochs.get(id) !== historyEpoch ||
        messages.some((m) => m.historyEpoch !== historyEpoch)
      )
        return;
      const item = info(id);
      if (item) await save(sessionFrom(item, messages));
    },
    async deleteConversation(id) {
      if (!resetting) await db.deleteSession(id);
    },
  },
  useMessageOptions: {
    responseProvider: async () => {
      throw new Error("No DeepSeek request prepared");
    },
    onCompletionChunk({ currentMessage, choice }) {
      const message = choice.delta?.deepseek as AssistantMessage;
      Object.assign(currentMessage, wrap(message));
    },
  },
});
export const useChatStore = {
  state: computed(() => ({
    ready: ready.value,
    initError: initError.value,
    importingHistory: importingHistory.value,
    sessions: conversation.conversations.value
      .map((item) => ({ ...item, title: item.title || "" }))
      .sort((a, b) => b.updatedAt - a.updatedAt),
    activeId: conversation.activeConversationId.value,
    sessionCache: Object.fromEntries(
      [...engines.keys()].flatMap((id) => {
        const session = getSession(id);
        return session ? [[id, session]] : [];
      }),
    ),
    streaming: Object.fromEntries(
      [...engines].filter(([, engine]) => engine.isProcessing.value).map(([id]) => [id, true]),
    ),
    sessionLoadErrors: sessionLoadErrors.value,
    sessionSaveErrors: sessionSaveErrors.value,
  })),
  getState: () => useChatStore.state.value,
};
function remember(id: string, engine: UseMessageReturn) {
  engines.set(id, engine);
  for (const [key, value] of engines)
    if (key !== id && value.canStartTurn.value && !dirty.has(key)) engines.delete(key);
}
export function initChat(): Promise<void> {
  if (retryLoad) return retryLoad;
  if (!initError.value || importingHistory.value) return Promise.resolve();
  const epoch = historyEpoch;
  initError.value = false;
  return (retryLoad = loadList()
    .then((list) => {
      if (epoch === historyEpoch)
        conversation.conversations.value = [
          ...new Map(
            [...list, ...conversation.conversations.value].map((item) => [item.id, item]),
          ).values(),
        ];
    })
    .finally(() => {
      retryLoad = undefined;
    }));
}
const persist = (id: string) => {
  void conversation.saveMessages(id);
};
export const retrySaveSessions = () => {
  if (importingHistory.value) return;
  for (const [id, session] of dirty) void save(getSession(id) ?? session);
  for (const id of Object.keys(sessionSaveErrors.value))
    if (!dirty.has(id)) conversation.updateConversationTitle(id, info(id)?.title);
};
export function bindChatPersistence() {
  const flush = () => {
    for (const id of engines.keys()) persist(id);
    retrySaveSessions();
  };
  document.addEventListener("visibilitychange", flush);
  window.addEventListener("pagehide", flush);
  return () => {
    document.removeEventListener("visibilitychange", flush);
    window.removeEventListener("pagehide", flush);
  };
}
export function newChat() {
  if (!importingHistory.value) {
    navigation++;
    conversation.activeConversationId.value = null;
  }
}
export async function selectSession(id: string) {
  if (importingHistory.value) return;
  const token = ++navigation;
  navigationQueue = navigationQueue.then(async () => {
    if (token !== navigation) return;
    try {
      // Preload once: Kit treats loader errors as empty messages. Never let a read
      // failure become a new writable engine, or let a stale load evict the new selection.
      if (!engines.has(id)) {
        const stored = dirty.get(id) ?? (await db.loadSession(id));
        if (!stored) throw new Error("Missing conversation");
        loadedSessions.set(id, stored);
      }
      if (token !== navigation) return;
      const active = await conversation.switchConversation(id);
      if (token !== navigation) {
        conversation.activeConversationId.value = null;
        return;
      }
      if (active) remember(id, active.engine);
      delete sessionLoadErrors.value[id];
    } catch (error) {
      sessionLoadErrors.value[id] = true;
      db.reportStorageError("load conversation")(error);
    } finally {
      loadedSessions.delete(id);
    }
  });
  await navigationQueue;
}
export function renameSession(id: string, title: string) {
  if (importingHistory.value || deletions.has(id)) return;
  titleRequests.delete(id);
  conversation.updateConversationTitle(id, title);
}
export function removeSession(id: string): Promise<boolean> {
  if (importingHistory.value) return Promise.resolve(false);
  if (deletions.has(id)) return deletions.get(id)!;
  const task = (async () => {
    await stopReply(id);
    const removed = info(id),
      active = conversation.activeConversationId.value,
      token = navigation;
    try {
      await conversation.deleteConversation(id);
      engines.delete(id);
      dirty.delete(id);
      pendingFiles.delete(id);
      clearDraft(id);
      return true;
    } catch (error) {
      // Restore only this record; the user may have created or selected another chat.
      if (removed && !info(id)) conversation.conversations.value.push(removed);
      engines.delete(id);
      if (active === id && token === navigation && conversation.activeConversationId.value === null)
        await selectSession(id);
      db.reportStorageError("delete conversation")(error);
      return false;
    } finally {
      deletions.delete(id);
    }
  })();
  deletions.set(id, task);
  return task;
}
export const stopReply = async (id: string) => {
  await engines.get(id)?.abortRequest();
  await turns.get(id);
};
export async function replaceHistory(write: () => Promise<void>): Promise<number> {
  if (importingHistory.value) throw new Error("History replacement already running");
  importingHistory.value = true;
  navigation++;
  try {
    await navigationQueue;
    await Promise.all(deletions.values());
    await Promise.all([...engines.keys()].map(stopReply));
    await Promise.all(turns.values());
    await Promise.all([...engines.keys()].map((id) => conversation.saveMessages(id)));
    await db.clearStaging();
    await write();
    const summaries = await db.commitStaging();
    historyEpoch++;
    navigation++;
    resetting = true;
    conversation.clear();
    resetting = false;
    engines.clear();
    dirty.clear();
    pendingFiles.clear();
    clearAllDrafts();
    conversation.conversations.value = summaries;
    sessionSaveErrors.value = {};
    sessionLoadErrors.value = {};
    ready.value = true;
    return summaries.length;
  } catch (error) {
    await db.clearStaging().catch(db.reportStorageError("clear staging"));
    throw error;
  } finally {
    importingHistory.value = false;
    retrySaveSessions();
  }
}
const createReply = (): AssistantMessage => ({
  id: createId(),
  role: "assistant",
  createdAt: Date.now(),
  model: MODEL,
  thinking: useSettings.getState().thinking,
  search: useSettings.getState().search,
  prefix: true,
  status: "pending",
  blocks: [],
});
function run(id: string, initial: AssistantMessage, request: Request) {
  const engine = engines.get(id)!;
  if (!info(id)?.title) titleRequests.add(id);
  engine.responseProvider.value = createDeepSeekProvider({
    getSession,
    updateSession,
    persist,
    getEpoch: () => historyEpoch,
    locked: () => importingHistory.value,
    wantsTitle: () => titleRequests.has(id),
    cancelTitle: () => titleRequests.delete(id),
  })(id, initial, request);
  // The engine appends and streams the assistant; retain the branch edges on its reply.
  const turn = engine
    .send()
    .catch(db.reportStorageError("message engine"))
    .finally(async () => {
      titleRequests.delete(id);
      await conversation.saveMessages(id);
      turns.delete(id);
    });
  turns.set(id, turn);
}
function branch(
  id: string,
  parentId: string | null,
  additions: Message[],
  reply: AssistantMessage,
  request: Request,
) {
  updateSession(id, (session) => {
    const next = appendBranch(session, parentId, [...additions, reply]);
    Object.assign(reply, next.messages.at(-1));
    // Kit creates the assistant message, so only retain the preceding tree here.
    return { ...next, updatedAt: Date.now(), messages: next.messages.slice(0, -1) };
  });
  run(id, reply, request);
}
export function sendMessage(targetId: string | null) {
  if (importingHistory.value || !ready.value || (targetId && deletions.has(targetId))) return false;
  const prepared = prepareDraftMessage(getDraft(targetId), useUploads.getState().tasks);
  if (
    !prepared ||
    (targetId && (!engines.get(targetId)?.canStartTurn.value || !getSession(targetId)))
  )
    return false;
  if (!targetId) {
    const active = conversation.createConversation({
      title: "",
      metadata: { rootMessageId: null },
    });
    remember(active.id, active.engine);
  }
  const id = targetId ?? conversation.activeConversationId.value!;
  const history = getVisibleMessages(getSession(id)!);
  const { text, files } = prepared;
  const question: UserMessage = {
    id: createId(),
    role: "user",
    content: text,
    createdAt: Date.now(),
    files: files.map(({ blob: _, ...file }) => file),
  };
  if (files.length)
    pendingFiles.set(id, [
      ...(pendingFiles.get(id) ?? []),
      ...files.map(({ id, blob }) => ({ id, blob })),
    ]);
  clearSentDraft(targetId);
  branch(id, history.at(-1)?.id ?? null, [question], createReply(), { history, question });
  return true;
}
function pathFor(id: string) {
  const session = getSession(id);
  return !importingHistory.value &&
    !deletions.has(id) &&
    engines.get(id)?.canStartTurn.value &&
    session
    ? getVisibleMessages(session)
    : [];
}
export function regenerateReply(id: string, messageId?: string) {
  const path = pathFor(id),
    index = messageId ? path.findIndex((m) => m.id === messageId) : path.length - 1;
  const question = path[index - 1];
  if (question?.role === "user" && path[index]?.role === "assistant")
    branch(id, question.id, [], createReply(), { history: path.slice(0, index - 1), question });
}
export function editMessage(id: string, messageId: string, content: string): boolean {
  const path = pathFor(id),
    index = path.findIndex((m) => m.id === messageId),
    previous = path[index];
  if (previous?.role !== "user" || (!content.trim() && !previous.files.length)) return false;
  const question: UserMessage = {
    ...previous,
    id: createId(),
    content: content.trim(),
    createdAt: Date.now(),
  };
  branch(id, path[index - 1]?.id ?? null, [question], createReply(), {
    history: path.slice(0, index),
    question,
  });
  return true;
}
export function selectMessageVersion(id: string, messageId: string) {
  if (pathFor(id).length) {
    updateSession(id, (s) => selectVersion(s, messageId));
    persist(id);
  }
}
function resume(id: string, messageId: string, continuation: boolean) {
  const path = pathFor(id),
    index = path.findIndex((m) => m.id === messageId),
    previous = path[index],
    question = path[index - 1];
  if (
    previous?.role !== "assistant" ||
    question?.role !== "user" ||
    (continuation
      ? index !== path.length - 1 || !canContinueReply(previous)
      : previous.error?.kind !== "upload")
  )
    return;
  const reply: AssistantMessage = {
    ...createReply(),
    ...previous,
    model: previous.model ?? MODEL,
    status: "pending",
    error: undefined,
    stopReason: undefined,
    stopDetails: undefined,
  };
  updateSession(id, (s) => ({
    ...s,
    messages: s.messages.filter((m) => m.id !== messageId),
    updatedAt: Date.now(),
  }));
  run(id, reply, {
    history: path.slice(0, index - 1),
    question,
    ...(continuation ? { prefix: previous } : {}),
  });
}
export const continueReply = (id: string, messageId: string) => resume(id, messageId, true);
export const retryUpload = (id: string, messageId: string) => resume(id, messageId, false);

const kitRuntime = useChatRuntimeFromConversation({
  conversation,
  send: ({ conversationId }) => sendMessage(conversationId),
});
export const runtime = {
  ...kitRuntime,
  activeConversation: computed(() => {
    const active = kitRuntime.activeConversation.value,
      session = active && getSession(active.id);
    return active && session
      ? {
          ...active,
          messages: getVisibleMessages(session).map((message) => ({
            id: message.id,
            role: message.role,
            content: [{ type: "deepseek", original: message, sessionId: active.id }],
          })),
        }
      : null;
  }),
  actions: {
    ...kitRuntime.actions,
    clearActiveConversation: newChat,
    switchConversation: selectSession,
    renameConversation: renameSession,
    deleteConversation: async (id: string) => {
      if (!(await removeSession(id))) throw new Error("Delete failed");
    },
  },
};
