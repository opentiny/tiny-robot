import { test, expect, type Page } from "@playwright/test";
import { createServer, type Server } from "node:http";
function sse(text: string, reason = "end_turn") {
  const events = [
    { type: "message_start", message: { id: "reply-id", model: "deepseek-flash" } },
    {
      type: "content_block_start",
      index: 0,
      content_block: { type: "thinking", thinking: "", signature: "" },
    },
    {
      type: "content_block_delta",
      index: 0,
      delta: { type: "thinking_delta", thinking: "分析问题" },
    },
    { type: "content_block_delta", index: 0, delta: { type: "signature_delta", signature: "sig" } },
    { type: "content_block_stop", index: 0 },
    { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } },
    { type: "content_block_delta", index: 1, delta: { type: "text_delta", text } },
    { type: "content_block_stop", index: 1 },
    {
      type: "message_delta",
      delta: { stop_reason: reason, stop_sequence: null, title: "测试对话" },
    },
    { type: "message_stop" },
  ];
  return events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join("");
}
async function setup(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("deepseek-vue-chat:api-key", "test-key");
    localStorage.setItem("deepseek-vue-chat:locale", "zh-CN");
  });
  await page.route("https://api.deepseek.com/models", (r) => r.fulfill({ json: { data: [] } }));
  await page.goto("/");
}
async function send(page: Page, text: string) {
  await page.locator("[contenteditable=true]").fill(text);
  await page.getByRole("button", { name: "发送", exact: true }).click();
}
test("streaming, branch editing, regenerate, continue and persisted history", async ({ page }) => {
  const requests: any[] = [];
  await page.route("**/anthropic/v1/messages", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      contentType: "text/event-stream",
      body: sse(
        `回答 ${requests.length}\n\n**粗体** 和 $x^2$\n\n\`\`\`javascript\nconst x = 1\n\`\`\``,
        requests.length === 3 ? "max_tokens" : "end_turn",
      ),
    });
  });
  await setup(page);
  await send(page, "第一问");
  await expect(page.getByText("回答 1", { exact: false })).toBeVisible();
  expect(requests[0].model).toBe("deepseek-flash");
  expect(requests[0].tools).toContainEqual({
    type: "deepseek_read_url",
    name: "deepseek_read_url",
  });
  expect(requests[0].safety_check.level).toBe("high");
  await page.getByRole("button", { name: "重新生成", exact: true }).click();
  await expect(page.getByText("回答 2", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "上一个版本", exact: true }).click();
  await expect(page.getByText("回答 1", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "编辑消息", exact: true }).click();
  await page.getByRole("textbox", { name: "编辑消息", exact: true }).fill("修改问题");
  await page.locator(".message form").getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText("回答 3", { exact: false })).toBeVisible();
  expect(requests[2].messages.at(-1).content).toBe("修改问题");
  await page.getByRole("button", { name: "继续生成", exact: true }).click();
  await expect(page.getByText("回答 4", { exact: false })).toBeVisible();
  expect(requests[3].messages.at(-1).role).toBe("assistant");
  await page.reload();
  await page.locator(".chat-left-aside-history").getByText("测试对话", { exact: true }).click();
  await expect(page.getByText("回答 4", { exact: false })).toBeVisible();
});
test("uploads are sent using file blocks; skill context reaches API", async ({ page }) => {
  let body: any;
  await page.route("**/anthropic/v1/files", (r) =>
    r.fulfill({
      json: {
        id: "file-1",
        type: "file",
        filename: "sample.txt",
        mime_type: "text/plain",
        size_bytes: 5,
      },
    }),
  );
  await page.route("**/anthropic/v1/messages", (r) => {
    body = r.request().postDataJSON();
    return r.fulfill({ contentType: "text/event-stream", body: sse("文件已收到") });
  });
  await setup(page);
  await page.getByRole("button", { name: "MCP / Skills", exact: false }).click();
  await page.locator(".extension-body input[type=file]").setInputFiles({
    name: "review.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("请始终列出验证依据"),
  });
  await page.getByRole("checkbox", { name: "review", exact: true }).check();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page
    .locator(".suite-app > input[type=file]")
    .setInputFiles({ name: "sample.txt", mimeType: "text/plain", buffer: Buffer.from("hello") });
  await expect(page.getByText("上传中...")).toHaveCount(0);
  await send(page, "分析文件");
  await expect(page.getByText("文件已收到", { exact: true })).toBeVisible();
  expect(body.system).toContain("请始终列出验证依据");
  expect(body.messages.at(-1).content).toContainEqual({
    type: "document",
    source: { type: "file", file_id: "file-1" },
  });
});
test("invalid ZIP preserves chats; valid ZIP roundtrips", async ({ page }) => {
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({ contentType: "text/event-stream", body: sse("保留的数据") }),
  );
  await setup(page);
  await send(page, "归档测试");
  await expect(page.getByText("保留的数据", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "设置", exact: false }).click();
  await page.getByRole("button", { name: "数据管理", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const download = await pending;
  const path = await download.path();
  expect(path).toBeTruthy();
  page.on("dialog", (d) => d.accept());
  await page.locator('input[accept=".zip"]').setInputFiles({
    name: "invalid.zip",
    mimeType: "application/zip",
    buffer: Buffer.from("invalid"),
  });
  await page.getByRole("button", { name: "确认导入", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("文件导入失败");
  await page.locator('input[accept=".zip"]').setInputFiles(path!);
  await page.getByRole("button", { name: "确认导入", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("已导入 1 个对话");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.locator(".chat-left-aside-history").getByText("测试对话", { exact: true }).click();
  await expect(page.getByText("保留的数据", { exact: true })).toBeVisible();
});
test("HTTP error visible; mobile fits viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({ status: 429, json: { error: { message: "rate limit" } } }),
  );
  await setup(page);
  await send(page, "你好");
  await expect(page.getByText("请求过于频繁，请稍后再试", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "打开边栏", exact: true }).click();
  await expect(page.getByRole("button", { name: "设置", exact: false })).toBeVisible();
});
test("real Streamable HTTP MCP initialize, tools/list and tools/call", async ({ page }) => {
  const methods: string[] = [];
  let server: Server;
  server = createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "content-type,mcp-session-id,mcp-protocol-version",
    );
    res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");
    if (req.method === "OPTIONS") {
      res.end();
      return;
    }
    if (req.method !== "POST") {
      res.writeHead(405);
      res.end();
      return;
    }
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      const body = JSON.parse(data);
      methods.push(body.method);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Mcp-Session-Id", "fixture-session");
      if (body.method === "notifications/initialized") {
        res.writeHead(202);
        res.end();
        return;
      }
      const result =
        body.method === "initialize"
          ? {
              protocolVersion: "2025-03-26",
              capabilities: { tools: {} },
              serverInfo: { name: "fixture", version: "1" },
            }
          : body.method === "tools/list"
            ? {
                tools: [
                  {
                    name: "echo",
                    description: "Echo arguments",
                    inputSchema: { type: "object", properties: { text: { type: "string" } } },
                  },
                ],
              }
            : { content: [{ type: "text", text: body.params.arguments.text }] };
      res.end(JSON.stringify({ jsonrpc: "2.0", id: body.id, result }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as any).port;
  try {
    await setup(page);
    await page.getByRole("button", { name: "MCP / Skills", exact: false }).click();
    await page.getByLabel("MCP name", { exact: true }).fill("本地测试");
    await page.getByLabel("MCP URL", { exact: true }).fill(`http://127.0.0.1:${port}/mcp`);
    await page.getByRole("button", { name: "添加", exact: true }).click();
    await page.getByRole("button", { name: "连接 / 发现工具", exact: true }).click();
    await expect(page.getByLabel("MCP tool", { exact: true })).toHaveValue("echo");
    await page.getByLabel("MCP arguments", { exact: true }).fill('{"text":"真实工具回包"}');
    page.on("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "调用工具", exact: true }).click();
    await page.getByRole("button", { name: "确定", exact: true }).click();
    await expect(page.locator(".mcp-result")).toContainText("真实工具回包");
    await page.screenshot({
      path: `${process.env.ARTIFACT_DIR || "test-results/evidence"}/vue-mcp-tools.png`,
      animations: "disabled",
    });
    await page.getByRole("button", { name: "将结果加入输入框", exact: true }).click();
    await expect(page.locator("[contenteditable=true]")).toContainText("真实工具回包");
    expect(methods).toEqual([
      "initialize",
      "notifications/initialized",
      "tools/list",
      "tools/call",
    ]);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
test("failed image upload can retry; attachment status and remove action follow locale", async ({
  page,
}) => {
  let attempts = 0;
  await page.route("**/anthropic/v1/files", (r) => {
    attempts++;
    return attempts === 1
      ? r.fulfill({
          status: 429,
          json: { error: { type: "rate_limit_error", message: "Try again" } },
        })
      : r.fulfill({
          json: {
            id: "file-retried",
            type: "file",
            filename: "retry.png",
            mime_type: "image/png",
            size_bytes: 68,
          },
        });
  });
  await setup(page);
  await page.locator(".suite-app > input[type=file]").setInputFiles({
    name: "retry.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF9sAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page
    .locator(".draft-attachment")
    .getByRole("button", { name: /重试/ })
    .click();
  await expect(page.locator(".draft-error")).toHaveCount(0);
  expect(attempts).toBe(2);
  await page
    .locator(".draft-attachment")
    .getByRole("button", { name: "删除", exact: true })
    .click();
  await expect(page.locator(".draft-attachment")).toHaveCount(0);
  await page.getByRole("button", { name: "设置", exact: true }).click();
  await page.getByRole("button", { name: "语言", exact: true }).click();
  await page.getByRole("menuitem", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .locator(".suite-app > input[type=file]")
    .setInputFiles({ name: "english.txt", mimeType: "text/plain", buffer: Buffer.from("hello") });
  await expect(
    page.locator(".draft-attachment").getByRole("button", { name: "Delete", exact: true }),
  ).toBeVisible();
});

test("editing a second message closes the first editor and keeps focus local", async ({ page }) => {
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({ contentType: "text/event-stream", body: sse("编辑焦点验证") }),
  );
  await setup(page);
  await send(page, "第一个问题");
  await expect(page.getByRole("button", { name: "停止生成", exact: true })).toHaveCount(0);
  await send(page, "第二个问题");
  await expect(page.getByRole("button", { name: "停止生成", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "编辑消息", exact: true }).first().click();
  await expect(page.getByRole("textbox", { name: "编辑消息", exact: true })).toHaveValue(
    "第一个问题",
  );
  await page.getByRole("button", { name: "编辑消息", exact: true }).nth(1).click();
  const editor = page.getByRole("textbox", { name: "编辑消息", exact: true });
  await expect(editor).toHaveCount(1);
  await expect(editor).toHaveValue("第二个问题");
  await expect(editor).toBeFocused();
  await editor.press("Escape");
  await expect(editor).toHaveCount(0);
});
