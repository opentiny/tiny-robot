import { translate } from "../../i18n/index.js";
import type {
  ServerToolKind,
  TextCitation,
  WebFetchToolResultBlock,
  WebSearchResult,
  WebSearchToolResultBlock,
} from "../api/types.js";
import type { AssistantMessage, ThinkingPart } from "./types.js";

/**
 * 由回复的内容块推导界面需要的结构：思考与工具步骤的时间线、带引用角标的正文、可引用的来源列表。
 * 只做纯计算，不改动内容块（内容块要原样回传）。
 */

export type Source = {
  url: string;
  title: string;
  /** 优先使用服务端站点名，没有时使用域名（去掉 www.） */
  siteName: string;
  /** 搜索结果为 RFC 3339，阅读链接为爬虫提取的原始日期 */
  publishedAt: string | null;
  /** 明文摘要与站点图标；缺少元数据时为 null */
  snippet: string | null;
  siteIcon: string | null;
  /** 引用角标与搜索结果列表上的编号，从 1 开始 */
  index: number;
};

export type ToolStatus = "wip" | "done" | "failed";

export const isDeepSearchKind = (kind: ServerToolKind) =>
  kind === "deep_search" || kind === "deep_image_search";

export const isImageSearchKind = (kind: ServerToolKind) =>
  kind === "image_search" || kind === "deep_image_search";

export type SearchStep = {
  type: "search";
  /** 该步骤首次调用的 ID，空查询的图搜也有稳定标识 */
  key: string;
  kind: ServerToolKind;
  queries: string[];
  results: Source[];
  status: ToolStatus;
};

export type PageItem = {
  id: string;
  url: string;
  title: string;
  status: ToolStatus;
};

export type OpenStep = { type: "open"; pages: PageItem[] };

export type FindStep = {
  type: "find";
  patterns: { id: string; pattern: string; status: ToolStatus }[];
};

export type ReadLinkStep = { type: "read_link"; links: PageItem[] };

export type ThinkingStep = { type: "thinking"; key: string; blocks: ThinkingPart[] };

/** 工具调用前输出的说明文字 */
export type PreambleStep = { type: "text"; key: string; markdown: string };

export type Step = SearchStep | OpenStep | FindStep | ReadLinkStep | ThinkingStep | PreambleStep;

export type ReplyView = {
  steps: Step[];
  /** 最后一个思考或工具块之后的正文；markdown 里在引用处插入了 [citation:N] */
  answer: { markdown: string; text: string } | null;
  /** 正文引用可指向的全部来源，按编号排列 */
  sources: Source[];
  /** 搜索到的网页（去重），用于底部汇总与搜索结果列表 */
  searchResults: Source[];
};

export const getSiteName = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const getStatus = (
  result: WebSearchToolResultBlock | WebFetchToolResultBlock | undefined,
  streaming: boolean,
): ToolStatus => {
  if (!result) {
    return streaming ? "wip" : "failed";
  }
  if (result.type === "web_search_tool_result") {
    return result.content.some((item) => item.type === "web_search_tool_result_error")
      ? "failed"
      : "done";
  }
  return result.content.type === "web_fetch_result" ? "done" : "failed";
};

const mergeStatus = (statuses: ToolStatus[]): ToolStatus =>
  statuses.includes("wip") ? "wip" : statuses.every((s) => s === "failed") ? "failed" : "done";

/** 来源登记：同一 URL 只编号一次，编号按首次出现的顺序 */
class SourceRegistry {
  readonly list: Source[] = [];
  private byUrl = new Map<string, Source>();

  add(
    url: string,
    title: string | null,
    publishedAt: string | null,
    metadata?: Pick<WebSearchResult, "snippet" | "site_icon" | "site_name">,
  ): Source {
    const siteName = metadata?.site_name?.trim() || getSiteName(url);
    const snippet = metadata?.snippet?.trim() || null;
    const siteIcon = metadata?.site_icon?.trim() || null;
    const existing = this.byUrl.get(url);
    if (existing) {
      // 同一网页可能先被打开，或先返回不完整元数据；后续结果补齐，不覆盖已有正文信息。
      if (existing.title === url && title) {
        existing.title = title;
      }
      if (existing.siteName === getSiteName(url)) {
        existing.siteName = siteName;
      }
      existing.publishedAt ||= publishedAt;
      existing.snippet ||= snippet;
      existing.siteIcon ||= siteIcon;
      return existing;
    }
    const source: Source = {
      url,
      title: title || url,
      siteName,
      publishedAt,
      snippet,
      siteIcon,
      index: this.list.length + 1,
    };
    this.list.push(source);
    this.byUrl.set(url, source);
    return source;
  }
}

/**
 * 文本块拼成一份 markdown：服务端在挂过引用的块之后另起新块，引用位置即块尾。
 * 引用之后的空白（含换行）仍留在被引用的块里，所以 [citation:N] 插在块尾空白之前。
 */
const joinTextBlocks = (
  blocks: { text: string; citations?: TextCitation[] }[],
  registry: SourceRegistry,
) => {
  let markdown = "";
  let text = "";
  for (const block of blocks) {
    text += block.text;
    const indexes = new Set<number>();
    for (const citation of block.citations ?? []) {
      indexes.add(registry.add(citation.url, citation.title, null).index);
    }
    const body = indexes.size > 0 ? block.text.trimEnd() : block.text;
    markdown += body;
    for (const index of indexes) {
      markdown += `[citation:${index}]`;
    }
    markdown += block.text.slice(body.length);
  }
  return { markdown, text };
};

export const buildReplyView = (reply: AssistantMessage, streaming: boolean): ReplyView => {
  const results = new Map<string, WebSearchToolResultBlock | WebFetchToolResultBlock>();
  for (const block of reply.blocks) {
    if (block.type === "web_search_tool_result" || block.type === "web_fetch_tool_result") {
      results.set(block.tool_use_id, block);
    }
  }

  const registry = new SourceRegistry();
  const searchResults: Source[] = [];
  const steps: Step[] = [];
  const mergedSearch = new Map<ServerToolKind, SearchStep>();
  let mergedThinking: ThinkingStep | null = null;
  let pendingText: { index: number; text: string; citations?: TextCitation[] }[] = [];

  // 来源编号按搜索结果、打开的网页在回复中出现的顺序，与正文引用无关
  for (const block of reply.blocks) {
    if (block.type !== "server_tool_use") {
      continue;
    }
    const result = results.get(block.id);
    if (result?.type === "web_search_tool_result") {
      for (const item of result.content) {
        if (item.type === "web_search_result") {
          const source = registry.add(item.url, item.title, item.page_age, item);
          if (!searchResults.includes(source)) {
            searchResults.push(source);
          }
        }
      }
    } else if (
      result?.type === "web_fetch_tool_result" &&
      result.content.type === "web_fetch_result" &&
      block.kind === "deep_search"
    ) {
      registry.add(result.content.url, result.content.content.title, result.content.published_at);
    }
  }

  const flushPreamble = () => {
    if (pendingText.length === 0) {
      return;
    }
    const { markdown } = joinTextBlocks(pendingText, registry);
    if (markdown.trim()) {
      steps.push({ type: "text", key: `text-${pendingText[0].index}`, markdown });
    }
    pendingText = [];
  };

  reply.blocks.forEach((block, index) => {
    // 模板统一由 describeReply 展示，不能混入模型正文或工具步骤前的说明文字。
    if (block.type === "text" && block.isTemplate) {
      return;
    }
    if (block.type !== "thinking") {
      mergedThinking = null;
    }
    if (block.type === "text") {
      pendingText.push({ index, text: block.text, citations: block.citations });
      return;
    }
    if (block.type === "thinking") {
      // 相邻思考块沿用同一个圆点和 Markdown；原始块与签名不变。
      if (mergedThinking) {
        mergedThinking.blocks.push(block);
      } else if (block.thinking) {
        flushPreamble();
        mergedThinking = { type: "thinking", key: `thinking-${index}`, blocks: [block] };
        steps.push(mergedThinking);
      }
      return;
    }
    if (block.type !== "server_tool_use") {
      return;
    }
    const result = results.get(block.id);
    // 只有签名、没有明文 URL 的网页仍用于请求，但没有可展示的链接。
    if (
      block.input.action === "read_link" &&
      !block.input.url &&
      !(
        result?.type === "web_fetch_tool_result" &&
        result.content.type === "web_fetch_result" &&
        result.content.url
      )
    ) {
      return;
    }
    flushPreamble();
    const { kind, input } = block;
    const status = getStatus(result, streaming);
    const last = steps.at(-1);

    if (input.action === "search") {
      const { queries } = input;
      const found =
        result?.type === "web_search_tool_result"
          ? result.content.flatMap((item) =>
              item.type === "web_search_result"
                ? [registry.add(item.url, item.title, item.page_age, item)]
                : [],
            )
          : [];
      // 普通搜索按种类聚合到首次出现的位置；边想边搜只合并相邻、同种类的调用。
      const target = isDeepSearchKind(kind)
        ? last?.type === "search" && last.kind === kind
          ? last
          : null
        : mergedSearch.get(kind);
      if (target) {
        target.queries.push(...queries);
        target.results.push(...found.filter((source) => !target.results.includes(source)));
        target.status = mergeStatus([target.status, status]);
      } else {
        const step: SearchStep = {
          type: "search",
          key: block.id,
          kind,
          queries: [...queries],
          results: found,
          status,
        };
        steps.push(step);
        if (!isDeepSearchKind(kind)) {
          mergedSearch.set(kind, step);
        }
      }
      return;
    }

    const fetched = result?.type === "web_fetch_tool_result" ? result.content : null;
    const page: PageItem = {
      id: block.id,
      url: input.url || (fetched?.type === "web_fetch_result" ? fetched.url : ""),
      title: (fetched?.type === "web_fetch_result" ? fetched.content.title : null) || input.url,
      status,
    };
    if (input.action === "read_link") {
      // 阅读链接仅展示进行态；成功、失败或中止后隐藏，原始结果仍保留用于后续请求。
      if (status !== "wip") {
        return;
      }
      if (last?.type === "read_link") {
        last.links.push(page);
      } else {
        steps.push({ type: "read_link", links: [page] });
      }
    } else if (input.action === "open_page") {
      if (last?.type === "open") {
        last.pages.push(page);
      } else {
        steps.push({ type: "open", pages: [page] });
      }
    } else {
      const item = { id: block.id, pattern: input.pattern, status };
      if (last?.type === "find") {
        last.patterns.push(item);
      } else {
        steps.push({ type: "find", patterns: [item] });
      }
    }
  });

  const answer = pendingText.length > 0 ? joinTextBlocks(pendingText, registry) : null;
  return {
    steps,
    answer: answer && answer.text ? answer : null,
    sources: registry.list,
    searchResults,
  };
};

/** 思考总用时（秒）：各思考块用时之和，至少 1 秒；有块缺少用时时返回 null。 */
export const getTotalThinkingSeconds = (steps: Step[], now: number) => {
  let total = 0;
  for (const step of steps) {
    if (step.type === "thinking") {
      for (const block of step.blocks) {
        if (block.elapsedSeconds !== undefined) {
          total += block.elapsedSeconds * 1000;
          continue;
        }
        if (block.startedAt === undefined) {
          return null;
        }
        total += (block.endedAt ?? now) - block.startedAt;
      }
    }
  }
  return Math.max(1, Math.round(total / 1000));
};

/** 折叠区标题 */
export const getAreaTitle = (
  view: ReplyView,
  streaming: boolean,
  now: number,
  hasResponse = view.answer !== null,
) => {
  if (hasResponse) {
    const count = getTotalThinkingSeconds(view.steps, now);
    if (count === null) {
      return translate("thinkingSwitch");
    }
    return translate(count === 1 ? "messageThinkDuration" : "messageThinkDurationPlural", {
      count,
    });
  }
  if (!streaming) {
    return translate("messageThinkStopped");
  }
  const last = view.steps.at(-1);
  if (last?.type === "search" && last.status === "wip") {
    return translate(isImageSearchKind(last.kind) ? "imageSearching" : "deepSearchSearching");
  }
  if (
    (last?.type === "open" && last.pages.some((page) => page.status === "wip")) ||
    (last?.type === "find" && last.patterns.some((item) => item.status === "wip"))
  ) {
    return translate("groupTitleToolOpen");
  }
  if (last?.type === "read_link" && last.links.some((link) => link.status === "wip")) {
    return translate("readingLink");
  }
  return translate("messageThinking");
};
