import { BackupError, fail } from "./errors.js";
import {
  EXPORT_FORMAT_VERSION,
  type ChatMessage,
  type FileEntry,
  type Fragment,
  type SearchResult,
  type SessionFile,
  type SessionIndexEntry,
} from "./format.js";

/**
 * 按格式定义校验，返回只含已定义字段的新对象：容器与元数据严格校验，无法解析的内容片段丢弃。
 * 可空字段必须显式为 null；可选字段允许缺省，存在时严格校验。
 */

type Read<T> = (value: unknown) => T;

const invalid = () => fail("backupIncomplete");

const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : invalid();

const string: Read<string> = (value) => (typeof value === "string" ? value : invalid());

const boolean: Read<boolean> = (value) => (typeof value === "boolean" ? value : invalid());

const number: Read<number> = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value : invalid();

/** 非负安全整数（u32 等） */
const count: Read<number> = (value) =>
  Number.isSafeInteger(value) && (value as number) >= 0 ? (value as number) : invalid();

const time: Read<string> = (value) => {
  if (typeof value !== "string") {
    return invalid();
  }
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d+))?Z$/.exec(value);
  if (!match) {
    return invalid();
  }
  // Date 只保留毫秒；校验时补齐/截断精度，返回时保留原文，避免丢失微秒或纳秒。
  const milliseconds = `${match[1]}.${(match[2] ?? "").padEnd(3, "0").slice(0, 3)}Z`;
  const parsed = new Date(milliseconds);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === milliseconds
    ? value
    : invalid();
};

const nullable =
  <T>(read: Read<T>): Read<T | null> =>
  (value) =>
    value === null ? null : read(value);

const list =
  <T>(read: Read<T>): Read<T[]> =>
  (value) =>
    Array.isArray(value) ? value.map(read) : invalid();

const oneOf =
  <const T extends string>(...values: T[]): Read<T> =>
  (value) =>
    values.includes(value as T) ? (value as T) : invalid();

const tipStyle = oneOf("INFO", "WARNING", "CAUTION");
const searchStatus = oneOf("WIP", "FINISHED", "FAILED");
const toolMetadata = (item: Record<string, unknown>) => ({
  ...("stage_id" in item ? { stage_id: count(item.stage_id) } : {}),
  ...("group_id" in item ? { group_id: count(item.group_id) } : {}),
});

const searchResult: Read<SearchResult> = (value) => {
  const item = record(value);
  return {
    url: string(item.url),
    title: string(item.title),
    snippet: string(item.snippet),
    published_at: nullable(time)(item.published_at),
    site_name: nullable(string)(item.site_name),
    ...("site_icon" in item ? { site_icon: nullable(string)(item.site_icon) } : {}),
  };
};

const fileEntry: Read<FileEntry> = (value) => {
  const item = record(value);
  return {
    id: string(item.id),
    file_name: string(item.file_name),
    file_size: count(item.file_size),
    token_usage: nullable(count)(item.token_usage),
    inserted_at: time(item.inserted_at),
    export_path: nullable(string)(item.export_path),
    is_image: boolean(item.is_image),
    width: nullable(count)(item.width),
    height: nullable(count)(item.height),
  };
};

const readFragment: Read<Fragment> = (value) => {
  const item = record(value);
  const type = string(item.type);
  switch (type) {
    case "REQUEST":
      return { type, content: string(item.content) };
    case "RESPONSE":
      return { type, content: string(item.content) };
    case "TEMPLATE_RESPONSE":
      return { type, content: string(item.content) };
    case "THINK":
      return {
        type,
        content: string(item.content),
        elapsed_secs: nullable(number)(item.elapsed_secs),
      };
    case "TIP":
      return { type, content: string(item.content), style: tipStyle(item.style) };
    case "CONTENT_RISK":
      return { type, content: string(item.content), style: tipStyle(item.style) };
    case "PARTIAL_FILE_READ": {
      const ratio = number(item.ratio);
      return { type, ratio: ratio >= 0 && ratio <= 100 ? ratio : invalid() };
    }
    case "TOOL_SEARCH":
      return {
        type,
        queries: list(string)(item.queries),
        results: list(searchResult)(item.results),
        ...("status" in item ? { status: searchStatus(item.status) } : {}),
        ...toolMetadata(item),
      };
    case "TOOL_OPEN":
      return {
        type,
        status: searchStatus(item.status),
        url: nullable(string)(item.url),
        title: nullable(string)(item.title),
        ...("snippet" in item ? { snippet: nullable(string)(item.snippet) } : {}),
        ...("site_name" in item ? { site_name: nullable(string)(item.site_name) } : {}),
        published_at: nullable(time)(item.published_at),
        ...toolMetadata(item),
      };
    case "TOOL_FIND":
      return {
        type,
        status: oneOf("WIP", "FINISHED", "NO_RESULT", "FAILED")(item.status),
        ...("pattern" in item ? { pattern: string(item.pattern) } : {}),
        ...toolMetadata(item),
      };
    case "READ_LINK":
      return {
        type,
        results: list((result) => {
          const entry = record(result);
          return {
            signature: string(entry.signature),
            ...("url" in entry ? { url: string(entry.url) } : {}),
            ...("title" in entry ? { title: nullable(string)(entry.title) } : {}),
          };
        })(item.results),
      };
    case "FILE":
      return { type, files: list(fileEntry)(item.files) };
    case "TOOL_IMAGE_SEARCH":
      return {
        type,
        status: searchStatus(item.status),
        ...("image_indexes" in item ? { image_indexes: list(count)(item.image_indexes) } : {}),
        ...toolMetadata(item),
        results: list((result) => {
          const entry = record(result);
          return {
            title: string(entry.title),
            source_page_url: string(entry.source_page_url),
            snippet: string(entry.snippet),
            site_name: nullable(string)(entry.site_name),
            published_at: nullable(time)(entry.published_at),
          };
        })(item.results),
      };
    default:
      return invalid();
  }
};

/** 单个内容片段不兼容不影响其余消息；容器、元数据和后续消息树校验仍严格执行。 */
const fragment: Read<Fragment | null> = (value) => {
  try {
    return readFragment(value);
  } catch (error) {
    if (error instanceof BackupError && error.key === "backupIncomplete") {
      return null;
    }
    throw error;
  }
};

const message: Read<ChatMessage> = (value) => {
  const item = record(value);
  return {
    id: count(item.id),
    parent_id: nullable(count)(item.parent_id),
    role: oneOf("USER", "ASSISTANT")(item.role),
    status: oneOf(
      "WIP",
      "FINISHED",
      "CONTENT_FILTER",
      "FAILED",
      "INCOMPLETE",
      "CONTEXT_LENGTH_EXCEEDED",
      "TIMEOUT",
    )(item.status),
    thinking_enabled: boolean(item.thinking_enabled),
    search_enabled: boolean(item.search_enabled),
    accumulated_token_usage: count(item.accumulated_token_usage),
    inserted_at: time(item.inserted_at),
    fragments: list(fragment)(item.fragments).filter((item): item is Fragment => item !== null),
  };
};

/** 会话 ID 用于拼接条目名，不能含路径分隔符 */
const sessionId: Read<string> = (value) => {
  const id = string(value);
  return id && !/[/\\]/.test(id) && id !== "." && id !== ".." ? id : invalid();
};

/** 版本号用于校验归档格式兼容性；字段结构由各字段的校验函数保证。 */
export const checkManifest = (value: unknown): void => {
  const version = record(value).export_format_version;
  if (typeof version === "number" && version > EXPORT_FORMAT_VERSION) {
    fail("backupNewerVersion");
  }
  if (version !== EXPORT_FORMAT_VERSION) {
    fail("backupInvalidVersion");
  }
};

export const readSessionIndex: Read<SessionIndexEntry[]> = list((value) => {
  const item = record(value);
  return {
    id: sessionId(item.id),
    title: nullable(string)(item.title),
    pinned: false,
    message_count: count(item.message_count),
    inserted_at: time(item.inserted_at),
    updated_at: time(item.updated_at),
  };
});

export const readSessionFile: Read<SessionFile> = (value) => {
  const item = record(value);
  return {
    id: sessionId(item.id),
    title: nullable(string)(item.title),
    pinned: false,
    current_message_id: count(item.current_message_id),
    inserted_at: time(item.inserted_at),
    updated_at: time(item.updated_at),
    messages: list(message)(item.messages),
  };
};
