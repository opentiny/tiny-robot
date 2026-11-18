import { test, expect } from "@playwright/test";
const directory = process.env.ARTIFACT_DIR || "test-results/evidence";
const source = {
  type: "web_search_result",
  url: "https://example.com/",
  title: "Vue 与 TinyRobot",
  snippet: "固定来源摘要，用于原版与 Vue 版同条件界面对照。",
  site_name: "Example",
  site_icon: null,
  page_age: null,
  encrypted_content: "",
};
const events = [
  { type: "message_start", message: { id: "parity", model: "deepseek-flash" } },
  {
    type: "content_block_start",
    index: 0,
    content_block: {
      type: "thinking",
      thinking: "先核对网页来源，再整理开发步骤。",
      signature: "test",
    },
  },
  {
    type: "content_block_start",
    index: 1,
    content_block: {
      type: "server_tool_use",
      id: "search",
      name: "deepseek_web_search",
      kind: "search",
      caller: { type: "direct" },
      input: { action: "search", queries: ["Vue TinyRobot"] },
    },
  },
  {
    type: "content_block_start",
    index: 2,
    content_block: {
      type: "web_search_tool_result",
      tool_use_id: "search",
      kind: "search",
      content: [source],
    },
  },
  {
    type: "content_block_start",
    index: 3,
    content_block: {
      type: "text",
      text: '## 开始构建聊天应用\n\n使用 **Vue 3** 与 TinyRobot 搭建页面。\n\n- 保留对话与附件\n- 接入真实流式接口\n\n```js\nconst message = "Hello, Vue!"\nconsole.log(message)\n```\n\n公式：$x^2+1$。',
      citations: [
        {
          type: "web_search_result_location",
          url: source.url,
          title: source.title,
          cited_text: "使用 Vue 3 与 TinyRobot",
          encrypted_index: "",
        },
      ],
    },
  },
  {
    type: "message_delta",
    delta: { stop_reason: "end_turn", stop_sequence: null, title: "界面对照" },
  },
  { type: "message_stop" },
];
for (const mobile of [false, true])
  for (const dark of [false, true])
    test(`paired scenes ${mobile ? "mobile" : "desktop"} ${dark ? "dark" : "light"}`, async ({
      browser,
    }) => {
      for (const [name, origin, prefix] of [
        ["reference", "http://127.0.0.1:8090", "chat-demo"],
        ["vue", "http://127.0.0.1:8095", "deepseek-vue-chat"],
      ]) {
        const ctx = await browser.newContext({
          viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
          locale: "zh-CN",
        });
        await ctx.addInitScript(
          ({ prefix, dark }) => {
            localStorage.setItem(`${prefix}:api-key`, "test");
            localStorage.setItem(`${prefix}:theme-preference`, dark ? "dark" : "light");
            localStorage.setItem(`${prefix}:locale`, "zh-CN");
          },
          { prefix, dark },
        );
        await ctx.route("**/anthropic/v1/messages", (r) =>
          r.fulfill({
            contentType: "text/event-stream",
            body: events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(""),
          }),
        );
        await ctx.route("**/anthropic/v1/files", (r) =>
          r.fulfill({
            json: {
              id: "file-parity",
              filename: "sample.txt",
              size_bytes: 23,
              mime_type: "text/plain",
              type: "file",
              created_at: new Date().toISOString(),
              downloadable: true,
            },
          }),
        );
        const page = await ctx.newPage();
        await page.goto(origin);
        const input =
          name === "vue"
            ? page.locator("[contenteditable=true]")
            : page.getByPlaceholder("请输入消息", { exact: true });
        await input.fill("请介绍 Vue 聊天应用，并提供代码示例。");
        await page.getByRole("button", { name: "发送", exact: true }).click();
        await expect(page.getByText("开始构建聊天应用", { exact: true })).toBeVisible();
        await expect(page.locator(".katex")).toBeVisible();
        const shot = async (scene: string) =>
          page.screenshot({
            path: `${directory}/${name}-${mobile ? "mobile" : "desktop"}-${dark ? "dark" : "light"}-${scene}.png`,
            animations: "disabled",
          });
        await shot("conversation");
        await page.getByText("1 个网页", { exact: true }).click();
        await shot("sources");
        if (name === "vue") await page.locator(".source-panel").getByRole("button").first().click();
        else await page.getByRole("button", { name: "关闭", exact: true }).click();
        if (mobile) await page.getByRole("button", { name: "打开边栏", exact: true }).click();
        await shot("sidebar");
        await page.getByRole("button", { name: "设置", exact: true }).click();
        await page
          .getByRole(name === "vue" ? "button" : "tab", { name: "数据管理", exact: true })
          .click();
        await shot("data");
        await page.getByRole("button", { name: "关闭", exact: true }).click();
        await page.getByRole("button", { name: "开启新对话", exact: true }).first().click();
        await page
          .locator("input[type=file]")
          .first()
          .setInputFiles({
            name: "sample.txt",
            mimeType: "text/plain",
            buffer: Buffer.from("Attachment parity text."),
          });
        await expect(page.getByText("sample.txt", { exact: true })).toBeVisible();
        await shot("attachment");
        await ctx.close();
      }
    });
