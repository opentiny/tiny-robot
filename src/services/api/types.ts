/**
 * Messages API（Anthropic 兼容格式）协议类型，只取本应用用到的部分。
 * 文档：https://api-docs.deepseek.com/zh-cn/api/create-message
 * 声明 deepseek_web_search / deepseek_read_url 或设置 safety_check.level 为 high 时进入扩展模式。
 */

export type ChatModel = "deepseek-flash" | "deepseek-v4-pro";

// ---------- 响应：内容块 ----------

/** 正文引用：服务端把模型的引用标记还原为来源，挂在对应文本块上 */
export type TextCitation = {
  type: "web_search_result_location";
  url: string;
  /** 查不到标题时为 null */
  title: string | null;
  /** 当前文本块截至该引用处的全部正文（去除首尾空白） */
  cited_text: string;
  /** 恒为空串 */
  encrypted_index: string;
};

/** 文本块：挂过引用的块之后，后续正文另起新块；同一块内引用按 url 去重 */
export type TextBlock = { type: "text"; text: string; citations?: TextCitation[] };

/** 思考块：签名在块结束前经 signature_delta 下发，值为本次响应的消息 id */
export type ThinkingBlock = { type: "thinking"; thinking: string; signature: string };

/** 服务端识别调用所属联网能力用的 kind，区分文字搜索、图搜及边想边搜。 */
export type ServerToolKind =
  | "search"
  | "deep_search"
  | "read_link"
  | "image_search"
  | "deep_image_search";

/** server_tool_use 的四种动作，input 结构由 action 决定 */
export type ServerToolInput =
  | { action: "search"; query?: string; queries: string[] }
  | { action: "open_page"; url: string }
  /** 找不到关联页面时 url 为空串 */
  | { action: "find_in_page"; url: string; pattern: string }
  | { action: "read_link"; url: string };

/** 服务端工具调用块：原子下发，content_block_start 即携带完整 input */
export type ServerToolUseBlock = {
  type: "server_tool_use";
  /** srvtoolu_{s|ds|rl|is|dis}_{序号}_{32 位 hex} */
  id: string;
  /** 文字搜索与图搜均为 deepseek_web_search；read_link 为 deepseek_read_url */
  name: "deepseek_web_search" | "deepseek_read_url";
  input: ServerToolInput;
  caller: { type: "direct" };
  kind: ServerToolKind;
};

export type WebSearchResult = {
  type: "web_search_result";
  title: string;
  url: string;
  /** 图搜召回的原站图片地址，可能缺省；仅保存，当前不展示图片。 */
  image_url?: string;
  /** 可直接展示的网页摘要 */
  snippet: string;
  /** 站点图标 URL；无法取得注册域名时为 null */
  site_icon: string | null;
  /** 无站点名称时为 null */
  site_name: string | null;
  /** 搜索摘要经 AES-256-GCM 加密后的 Base64，客户端无法解密展示 */
  encrypted_content: string;
  /** RFC 3339 UTC 时间，没有发布时间时为 null */
  page_age: string | null;
};

export type WebSearchToolResultError = {
  type: "web_search_tool_result_error";
  error_code: "unavailable";
};

export type WebSearchToolResultBlock = {
  type: "web_search_tool_result";
  tool_use_id: string;
  /** 成功且无可见结果时为 []；失败时为只含一个错误项的数组 */
  content: (WebSearchResult | WebSearchToolResultError)[];
  kind: "search" | "deep_search" | "image_search" | "deep_image_search";
};

export type WebFetchResult = {
  type: "web_fetch_result";
  url: string;
  content: {
    type: "document";
    /** read_link / deep_search 均为空串；阅读链接的页面加密在结果块的 signature 中 */
    source: { type: "text"; media_type: "text/plain"; data: string };
    title: string | null;
  };
  /** read_link 为网页解析出的原始日期字符串；deep_search 为 RFC 3339 */
  published_at: string | null;
};

export type WebFetchToolResultError = {
  type: "web_fetch_tool_result_error";
  /** url_not_accessible 抓取失败；url_not_allowed 被拦截；unavailable 服务异常或未完成就结束 */
  error_code: "url_not_accessible" | "url_not_allowed" | "unavailable";
};

export type WebFetchToolResultBlock = {
  type: "web_fetch_tool_result";
  tool_use_id: string;
  content: WebFetchResult | WebFetchToolResultError;
  kind: "read_link" | "deep_search";
  /** 仅 read_link 成功时返回的加密页面，多轮请求原样回传；失败及 deep_search 不返回 */
  signature?: string;
};

export type ServerToolBlock =
  | ServerToolUseBlock
  | WebSearchToolResultBlock
  | WebFetchToolResultBlock;

/** 用于识别客户端工具调用的内容块类型 */
export type ToolUseBlock = { type: "tool_use"; id: string; name: string; input: unknown };

// ---------- 请求 ----------

export type TextBlockParam = { type: "text"; text: string };

/**
 * 文件块：引用经 Files API 上传的文件，图片用 image、其余用 document；
 * 图片请求需带 anthropic-beta: files-api-2025-04-14；扩展模式不支持 document，返回 400。
 */
export type FileBlockParam = {
  type: "image" | "document";
  source: { type: "file"; file_id: string };
};

/** 接口接受的调用块；历史只回传 kind 为 read_link 的调用 */
export type ServerToolUseBlockParam = Pick<
  ServerToolUseBlock,
  "type" | "id" | "name" | "input" | "kind"
>;

/** 接口接受的搜索结果块；历史搜索结果不回传 */
export type WebSearchToolResultBlockParam = WebSearchToolResultBlock;

/** 只回传 read_link 结果；成功时原样保留 signature，供服务端解密恢复网页上下文 */
export type WebFetchToolResultBlockParam = WebFetchToolResultBlock;

export type AssistantBlockParam =
  | TextBlockParam
  | ThinkingBlock
  | ServerToolUseBlockParam
  | WebSearchToolResultBlockParam
  | WebFetchToolResultBlockParam;

/** 末尾 assistant 自动触发继续生成，无需 prefix 字段 */
export type MessageParam =
  /** Chat Engine 扩展角色，位于对应 user 前；需服务端支持 latest_reminder。 */
  | { role: "latest_reminder"; content: string }
  | { role: "user"; content: string | (FileBlockParam | TextBlockParam)[] }
  | { role: "assistant"; content: AssistantBlockParam[] };

/** 开启联网搜索与边想边搜 */
export type DeepseekWebSearchTool = {
  type: "deepseek_web_search";
  name: "deepseek_web_search";
};

/** 阅读本轮用户消息中的链接，与搜索工具独立声明 */
export type DeepseekReadUrlTool = {
  type: "deepseek_read_url";
  name: "deepseek_read_url";
};

export type CreateMessageRequest = {
  model: ChatModel;
  system: string;
  messages: MessageParam[];
  thinking: { type: "enabled" | "disabled" };
  tools: (DeepseekWebSearchTool | DeepseekReadUrlTool)[];
  safety_check: { level: "high" };
  title?: { enabled: boolean };
};

// ---------- 响应：流式事件 ----------

export type StopReason = "end_turn" | "max_tokens" | "tool_use" | "refusal";

export type StopDetails = { type: "refusal"; category: null; explanation: null };

export type MessageUsage = {
  /** 未命中缓存的输入 Token */
  input_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  /** message_start 中为 0，message_delta 中为全轮累计值 */
  output_tokens: number;
  /** 仅当 message_delta 中有对外输出的搜索结果块时出现 */
  server_tool_use?: { web_search_requests: number; tool_search: number };
};

/** content_block_start 携带的初始内容块；工具块已是完整内容 */
export type OutputBlockStart = TextBlock | ThinkingBlock | ServerToolBlock | ToolUseBlock;

export type ContentBlockDelta =
  | { type: "text_delta"; text: string }
  | { type: "thinking_delta"; thinking: string }
  | { type: "signature_delta"; signature: string }
  | { type: "citations_delta"; citation: TextCitation }
  | { type: "input_json_delta"; partial_json: string };

/** 流式事件：SSE 的 event 名与 JSON 的 type 相同，以 message_stop 结束，不发送 [DONE] */
export type MessageStreamEvent =
  | {
      type: "message_start";
      /** id 为不带 msg_ 前缀的 UUID，等于响应头 x-ds-request-id */
      message: { id: string; model: string; usage?: MessageUsage };
    }
  | { type: "content_block_start"; index: number; content_block: OutputBlockStart }
  | { type: "content_block_delta"; index: number; delta: ContentBlockDelta }
  | { type: "content_block_stop"; index: number }
  | {
      type: "message_delta";
      /** title 仅在开启标题且生成成功时出现；stop_details 仅在 refusal 时出现 */
      delta: {
        stop_reason: StopReason;
        stop_sequence: null;
        stop_details?: StopDetails;
        title?: string;
      };
      usage?: MessageUsage;
    }
  | { type: "message_stop" }
  | { type: "ping" };

/**
 * POST /anthropic/v1/files 的 purpose：PDF 与 Word、PPT 需要服务端做版面解析；
 * 纯文本、代码、表格与电子书不需要解析，用 user_data。
 */
export type FilePurpose = "rich_layout_recognition" | "user_data";

/** POST /anthropic/v1/files 的响应 */
export type FileObject = {
  id: string;
  type: "file";
  size_bytes: number;
  created_at: string;
  filename: string;
  mime_type: string;
};

/** 非 2xx 响应体；流中出现只含 error 的无名 data 帧时同样按此解析 */
export type ApiErrorBody = {
  error: {
    message: string;
    type?: string;
    param?: string | null;
    code?: string | null;
  };
};
