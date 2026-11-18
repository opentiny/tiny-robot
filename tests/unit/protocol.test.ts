import { describe, it, expect } from "vitest";
import { readServerSentEvents, ServerSentEventDecoder } from "../../src/services/api/sse.js";
import {
  appendBranch,
  getVisibleMessages,
  selectVersion,
} from "../../src/services/chat/branches.js";
import {
  applyEvent,
  settleReply,
  canContinueReply,
  toRequestMessages,
} from "../../src/services/chat/reply.js";
import { buildReplyView } from "../../src/services/chat/view.js";
import type { AssistantMessage, Session, UserMessage } from "../../src/services/chat/types.js";
const user = (id: string): UserMessage => ({
  id,
  role: "user",
  content: id,
  files: [],
  createdAt: 1,
});
const reply = (id = "a"): AssistantMessage => ({
  id,
  role: "assistant",
  createdAt: 2,
  prefix: true,
  status: "pending",
  blocks: [],
});
describe("SSE boundaries", () => {
  it("decodes every UTF-8 byte split and CRLF", async () => {
    const bytes = new TextEncoder().encode("event: content\r\ndata: 中文🙂\r\ndata: next\r\n\r\n");
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        for (const b of bytes) c.enqueue(new Uint8Array([b]));
        c.close();
      },
    });
    const items = [];
    for await (const item of readServerSentEvents(stream)) items.push(item);
    expect(items).toEqual([{ event: "content", data: "中文🙂\nnext", lastEventId: "" }]);
  });
  it("ignores keepalive and unfinished frames", () => {
    const d = new ServerSentEventDecoder();
    expect(d.push(": ping\n\nevent: x\ndata: incomplete")).toEqual([]);
    expect(d.end()).toEqual([]);
  });
});
describe("message tree and protocol", () => {
  it("preserves sibling branches and selected descendants", () => {
    let s: Session = {
      id: "s",
      title: "",
      createdAt: 1,
      updatedAt: 1,
      messages: [],
      rootMessageId: null,
    };
    s = appendBranch(s, null, [user("u"), reply("a")]);
    s = appendBranch(s, "u", [reply("b")]);
    expect(getVisibleMessages(s).map((m) => m.id)).toEqual(["u", "b"]);
    s = selectVersion(s, "a");
    expect(getVisibleMessages(s).map((m) => m.id)).toEqual(["u", "a"]);
    expect(s.messages).toHaveLength(3);
  });
  it("ignores client-tool deltas without corrupting later text indexes", () => {
    let r = reply();
    const map = new Map<number, number>();
    r = applyEvent(
      r,
      {
        type: "content_block_start",
        index: 0,
        content_block: { type: "tool_use", id: "tool", name: "x", input: {} },
      },
      1,
      map,
    );
    r = applyEvent(
      r,
      { type: "content_block_start", index: 1, content_block: { type: "text", text: "A" } },
      2,
      map,
    );
    r = applyEvent(
      r,
      { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "B" } },
      3,
      map,
    );
    expect(r.blocks).toEqual([{ type: "text", text: "AB", citations: [] }]);
    expect(r.prefix).toBe(false);
  });
  it("refusal removes previously streamed text and thought", () => {
    const r = settleReply(
      {
        ...reply(),
        stopReason: "refusal",
        blocks: [
          { type: "text", text: "redacted" },
          { type: "thinking", thinking: "redacted" },
        ],
      },
      "done",
      3,
    );
    expect(r.blocks).toEqual([]);
    expect(canContinueReply(r)).toBe(false);
  });
  it("only eligible stopped/length-limited replies can continue", () => {
    const r = {
      ...reply(),
      status: "done" as const,
      stopReason: "max_tokens" as const,
      blocks: [{ type: "text" as const, text: "partial" }],
    };
    expect(canContinueReply(r)).toBe(true);
    expect(canContinueReply({ ...r, stopReason: "end_turn" })).toBe(false);
    expect(canContinueReply({ ...r, prefix: false })).toBe(false);
  });
  it("deduplicates citations and rejects no sources implicitly", () => {
    const r = {
      ...reply(),
      blocks: [
        {
          type: "text" as const,
          text: "fact ",
          citations: [
            {
              type: "web_search_result_location" as const,
              url: "https://example.com",
              title: "Example",
              cited_text: "fact",
              encrypted_index: "",
            },
          ],
        },
      ],
    };
    const v = buildReplyView(r, false);
    expect(v.answer?.markdown).toBe("fact[citation:1] ");
    expect(v.sources).toHaveLength(1);
  });
});
