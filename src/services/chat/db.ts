import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { toSessionSummary, type Session, type SessionSummary } from "./types.js";

/** IndexedDB 存储结构版本；新增或调整存储、索引时递增。 */
const DB_VERSION = 11;

/** 文件原件按附件的本地 id 存储，所有引用同一 id 的消息共用一份；用于缩略图、打开查看，以及没有 serverId 时补传。 */
export type StoredFile = {
  id: string;
  blob: Blob;
};

/** 文件引用留在摘要中，删除会话时通过索引判断原件是否仍被引用。 */
type StoredSessionSummary = SessionSummary & { fileIds: string[] };

interface ChatDB extends DBSchema {
  /** 当前使用的会话，界面读写都在这里 */
  sessions: { key: string; value: Session };
  sessionSummaries: {
    key: string;
    value: StoredSessionSummary;
    indexes: { fileIds: string };
  };
  /** 当前使用的文件原件 */
  files: { key: string; value: StoredFile };
  /**
   * 历史导入的暂存：导入过程中会话与原件只写入这两个存储，`sessions` / `files` 保持不变；
   * 全部校验通过后在一个事务中替换正式数据并清空暂存，失败时只清空暂存。
   */
  sessionsStaging: { key: string; value: Session };
  filesStaging: { key: string; value: StoredFile };
}

let dbPromise: Promise<IDBPDatabase<ChatDB>> | null = null;

const storedSummary = (session: Session): StoredSessionSummary => ({
  ...toSessionSummary(session),
  fileIds: [
    ...new Set(
      session.messages.flatMap((message) =>
        message.role === "user" ? message.files.map((file) => file.id) : [],
      ),
    ),
  ],
});

const abortTransaction = (tx: { abort(): void }) => {
  try {
    tx.abort();
  } catch {
    // 事务已因请求失败中止。
  }
};

// 每个操作拿到连接后立即创建事务；IndexedDB 按创建顺序执行范围重叠的事务，读取总能看到之前发起的写入。
const getDB = () =>
  (dbPromise ??= openDB<ChatDB>("deepseek-vue-chat", DB_VERSION, {
    upgrade(db, _oldVersion, _newVersion, tx) {
      // 初始化当前格式需要的存储与索引，不迁移旧消息。
      for (const name of ["sessions", "files", "sessionsStaging", "filesStaging"] as const) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: "id" });
        }
      }
      const summaries = db.objectStoreNames.contains("sessionSummaries")
        ? tx.objectStore("sessionSummaries")
        : db.createObjectStore("sessionSummaries", { keyPath: "id" });
      if (!summaries.indexNames.contains("fileIds")) {
        summaries.createIndex("fileIds", "fileIds", { multiEntry: true });
      }
    },
  }).catch((error: unknown) => {
    // 打开失败后允许界面重试，避免一直复用已拒绝的 Promise。
    dbPromise = null;
    throw error;
  }));

export const loadSessionSummaries = async (): Promise<SessionSummary[]> =>
  (await (await getDB()).getAll("sessionSummaries")).map(toSessionSummary);

export const loadSession = async (id: string): Promise<Session | undefined> =>
  (await getDB()).get("sessions", id);

export const saveSession = async (session: Session, files: StoredFile[] = []): Promise<void> => {
  const summary = storedSummary(session);
  const tx = (await getDB()).transaction(["sessions", "sessionSummaries", "files"], "readwrite");
  await Promise.all([
    (async () => {
      try {
        for (const file of files) {
          await tx.objectStore("files").put(file);
        }
        await tx.objectStore("sessions").put(session);
        await tx.objectStore("sessionSummaries").put(summary);
      } catch (error) {
        abortTransaction(tx);
        throw error;
      }
    })(),
    tx.done,
  ]);
};

/** 未打开的会话也可重命名，只读取该会话，原子更新详情和列表。 */
export const renameSession = async (id: string, title: string): Promise<void> => {
  const tx = (await getDB()).transaction(["sessions", "sessionSummaries"], "readwrite");
  await Promise.all([
    (async () => {
      try {
        const sessions = tx.objectStore("sessions");
        const session = await sessions.get(id);
        if (session) {
          session.title = title;
          await sessions.put(session);
          await tx.objectStore("sessionSummaries").put(storedSummary(session));
        }
      } catch (error) {
        abortTransaction(tx);
        throw error;
      }
    })(),
    tx.done,
  ]);
};

/** 删除会话，仅清理已无会话引用的本地原件；远端文件不删。 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  const tx = (await getDB()).transaction(["sessions", "sessionSummaries", "files"], "readwrite");
  await Promise.all([
    (async () => {
      try {
        const summaries = tx.objectStore("sessionSummaries");
        const summary = await summaries.get(sessionId);
        await tx.objectStore("sessions").delete(sessionId);
        await summaries.delete(sessionId);
        for (const id of summary?.fileIds ?? []) {
          if ((await summaries.index("fileIds").count(id)) === 0) {
            await tx.objectStore("files").delete(id);
          }
        }
      } catch (error) {
        abortTransaction(tx);
        throw error;
      }
    })(),
    tx.done,
  ]);
};

const putFiles = async (store: "files" | "filesStaging", files: StoredFile[]) => {
  const tx = (await getDB()).transaction(store, "readwrite");
  await Promise.all([...files.map((file) => tx.store.put(file)), tx.done]);
};

export const saveFiles = (files: StoredFile[]): Promise<void> => putFiles("files", files);

export const loadFile = async (id: string): Promise<Blob | undefined> =>
  (await (await getDB()).get("files", id))?.blob;

/** 清空导入暂存：开始导入前清除上次中断（如关闭页面）遗留的数据，导入失败后清除本次写入。 */
export const clearStaging = async (): Promise<void> => {
  const tx = (await getDB()).transaction(["sessionsStaging", "filesStaging"], "readwrite");
  await Promise.all([
    tx.objectStore("sessionsStaging").clear(),
    tx.objectStore("filesStaging").clear(),
    tx.done,
  ]);
};

export const addStagingSession = async (session: Session): Promise<void> => {
  await (await getDB()).add("sessionsStaging", session);
};

export const saveStagingFiles = (files: StoredFile[]): Promise<void> =>
  putFiles("filesStaging", files);

/** 图片位于会话 JSON 之后；全部读完后回填具体 MIME，保留归档给出的 isImage 标识。 */
export const updateStagingFileTypes = async (types: ReadonlyMap<string, string>): Promise<void> => {
  const tx = (await getDB()).transaction("sessionsStaging", "readwrite");
  await Promise.all([
    (async () => {
      for (let cursor = await tx.store.openCursor(); cursor; cursor = await cursor.continue()) {
        const session = cursor.value;
        let changed = false;
        for (const message of session.messages) {
          if (message.role !== "user") {
            continue;
          }
          for (const file of message.files) {
            const type = types.get(file.id) ?? "";
            if (file.mimeType !== type) {
              file.mimeType = type;
              changed = true;
            }
          }
        }
        if (changed) {
          await cursor.update(session);
        }
      }
    })(),
    tx.done,
  ]);
};

/**
 * 导入完成后用暂存替换正式数据：同一事务中替换会话、摘要和原件，并清空暂存。
 * 逐条游标复制，同一时间只读取一条记录；事务失败时整体回滚，正式数据不变。
 */
export const commitStaging = async (): Promise<SessionSummary[]> => {
  const summaries: SessionSummary[] = [];
  const tx = (await getDB()).transaction(
    ["sessions", "sessionSummaries", "files", "sessionsStaging", "filesStaging"],
    "readwrite",
  );
  const move = async (from: "sessionsStaging" | "filesStaging", to: "sessions" | "files") => {
    try {
      const target = tx.objectStore(to);
      await target.clear();
      if (to === "sessions") {
        await tx.objectStore("sessionSummaries").clear();
      }
      for (
        let cursor = await tx.objectStore(from).openCursor();
        cursor;
        cursor = await cursor.continue()
      ) {
        await target.put(cursor.value);
        if (to === "sessions") {
          const summary = storedSummary(cursor.value as Session);
          await tx.objectStore("sessionSummaries").put(summary);
          summaries.push(toSessionSummary(summary));
        }
      }
      await tx.objectStore(from).clear();
    } catch (error) {
      // 同步抛出的错误不会让事务自动回滚，需显式中止，避免只提交清空和部分移入。
      abortTransaction(tx);
      throw error;
    }
  };
  await Promise.all([move("sessionsStaging", "sessions"), move("filesStaging", "files"), tx.done]);
  // 直接返回本次提交的列表，调用方无需在替换成功后再发起可能失败的读取。
  return summaries;
};

/** 本地存储失败不打断对话，只在控制台留痕 */
export const reportStorageError = (action: string) => (error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(`[storage] ${action} failed`, error);
};
