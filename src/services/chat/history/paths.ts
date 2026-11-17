/** ZIP 条目名。条目顺序固定：manifest → user（可能缺失）→ 全部会话 JSON → index → 全部图片。 */

export const MANIFEST_PATH = "manifest.json";
export const USER_PATH = "user.json";
export const INDEX_PATH = "chat_session_index.json";

export const sessionPath = (sessionId: string) => `chat_sessions/${sessionId}.json`;

/** 会话自己的图片目录，带结尾斜杠 */
export const sessionFilesDir = (sessionId: string) => `chat_sessions/${sessionId}_files/`;

/** 会话 JSON 条目对应的会话 ID；其他条目返回 null */
export const parseSessionPath = (path: string): string | null =>
  /^chat_sessions\/([^/]+)\.json$/.exec(path)?.[1] ?? null;

/** 安全路径片段：路径分隔符映射为 _，空值、. 与 .. 映射为 unnamed */
const safeName = (name: string) => {
  const result = name.replace(/[/\\]/g, "_");
  return result === "" || result === "." || result === ".." ? "unnamed" : result;
};

/** chat_sessions/{session_id}_files/{file_id}_{file_name}；与 ZIP 读写端一致使用 NFC。 */
export const imagePath = (sessionId: string, fileId: string, fileName: string) =>
  `${sessionFilesDir(sessionId)}${safeName(fileId)}_${safeName(fileName)}`.normalize("NFC");
