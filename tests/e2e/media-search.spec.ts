import { test, expect } from "@playwright/test";
test.use({
  launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] },
});
const sse = (events: any[]) =>
  events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join("");
const start = { type: "message_start", message: { id: "m", model: "deepseek-flash" } };
const end = [
  {
    type: "message_delta",
    delta: { stop_reason: "end_turn", stop_sequence: null, title: "功能验证" },
  },
  { type: "message_stop" },
];
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("deepseek-vue-chat:api-key", "test"));
});
test("search steps, inline citation hover and source panel", async ({ page }) => {
  const source = {
    type: "web_search_result",
    url: "https://example.com/",
    title: "来源标题",
    snippet: "来源摘要",
    site_name: "Example",
    site_icon: null,
    page_age: null,
    encrypted_content: "",
  };
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({
      contentType: "text/event-stream",
      body: sse([
        start,
        {
          type: "content_block_start",
          index: 0,
          content_block: {
            type: "server_tool_use",
            id: "search1",
            name: "deepseek_web_search",
            kind: "search",
            caller: { type: "direct" },
            input: { action: "search", queries: ["测试搜索"] },
          },
        },
        {
          type: "content_block_start",
          index: 1,
          content_block: {
            type: "web_search_tool_result",
            tool_use_id: "search1",
            kind: "search",
            content: [source],
          },
        },
        {
          type: "content_block_start",
          index: 2,
          content_block: {
            type: "text",
            text: "有来源的回答",
            citations: [
              {
                type: "web_search_result_location",
                url: source.url,
                title: source.title,
                cited_text: "有来源的回答",
                encrypted_index: "",
              },
            ],
          },
        },
        ...end,
      ]),
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "智能搜索", exact: true }).click();
  await page.locator("[contenteditable=true]").fill("搜索测试");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.locator("a.citation")).toHaveAttribute("href", "https://example.com/");
  await page.locator("a.citation").hover();
  await expect(page.getByRole("tooltip")).toContainText("来源摘要");
  await page.getByRole("button", { name: "1 个网页", exact: true }).click();
  await expect(page.locator(".source-panel")).toContainText("来源标题");
  await expect(page.locator(".source-panel")).toBeInViewport();
  await page.screenshot({
    path: `${process.env.ARTIFACT_DIR || "test-results/evidence"}/vue-search.png`,
    animations: "disabled",
  });
});
test("browser microphone -> WAV ASR -> text, PCM TTS and stop", async ({ page, context }) => {
  await context.grantPermissions(["microphone"]);
  let asr = false,
    tts = false;
  await page.route("**/v1/tools/asr", async (r) => {
    expect(r.request().postDataBuffer()?.includes(Buffer.from("RIFF"))).toBe(true);
    asr = true;
    await r.fulfill({ json: { text: "语音转写测试" } });
  });
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({
      contentType: "text/event-stream",
      body: sse([
        start,
        {
          type: "content_block_start",
          index: 0,
          content_block: { type: "text", text: "语音答复" },
        },
        ...end,
      ]),
    }),
  );
  await page.route("**/v1/tools/tts", async (r) => {
    expect(r.request().postDataJSON()).toMatchObject({
      text: "语音答复",
      voice_id: "stella",
      format: "pcm",
    });
    tts = true;
    const pcm = Buffer.alloc(24000 * 2 * 3);
    for (let i = 0; i < pcm.length / 2; i++)
      pcm.writeInt16LE(Math.round(Math.sin((i / 24000) * Math.PI * 2 * 440) * 2000), i * 2);
    await r.fulfill({ contentType: "application/octet-stream", body: pcm });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "语音输入", exact: true }).click();
  await expect(page.locator(".recording")).toContainText(/录音中 [1-9]\d*s/);
  await page.getByRole("button", { name: "结束录音并转写", exact: true }).click();
  await expect(page.locator("[contenteditable=true]")).toContainText("语音转写测试");
  expect(asr).toBe(true);
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await page.getByRole("button", { name: "朗读", exact: true }).click();
  await expect.poll(() => tts).toBe(true);
  await page.getByRole("button", { name: "停止朗读", exact: true }).click();
  await expect(page.getByRole("button", { name: "朗读", exact: true })).toBeVisible();
});
test("Mermaid and KaTeX render without executing HTML", async ({ page }) => {
  const text =
    "公式 $x^2+1$\n\n```mermaid\ngraph LR\n A-->B\n```\n\n<script>window.pwned=true</script>";
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({
      contentType: "text/event-stream",
      body: sse([
        start,
        { type: "content_block_start", index: 0, content_block: { type: "text", text } },
        ...end,
      ]),
    }),
  );
  await page.goto("/");
  await page.locator("[contenteditable=true]").fill("公式图表");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.locator(".katex")).toBeVisible();
  await expect(page.locator(".diagram svg")).toBeVisible();
  await expect(page.locator(".diagram .nodeLabel").filter({ hasText: /^A$/ })).toBeVisible();
  await expect(page.locator(".diagram .nodeLabel").filter({ hasText: /^B$/ })).toBeVisible();
  expect(await page.evaluate(() => (window as any).pwned)).toBeUndefined();
  await page.getByRole("button", { name: "代码", exact: true }).click();
  await expect(page.locator("pre")).toContainText("graph LR");
});
