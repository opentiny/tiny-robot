import { test, expect } from "@playwright/test";
const events = (text: string) =>
  [
    { type: "message_start", message: { id: "m", model: "deepseek-flash" } },
    { type: "content_block_start", index: 0, content_block: { type: "text", text } },
    { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null } },
    { type: "message_stop" },
  ]
    .map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`)
    .join("");
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("deepseek-vue-chat:api-key", "test"));
  await page.goto("/");
});
test("stop cancels the request and late completion cannot replace the next chat", async ({
  page,
}) => {
  let first = true,
    release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/anthropic/v1/messages", async (r) => {
    if (first) {
      first = false;
      await gate;
      await r
        .fulfill({ contentType: "text/event-stream", body: events("过期回复") })
        .catch(() => {});
    } else await r.fulfill({ contentType: "text/event-stream", body: events("当前回复") });
  });
  await page.locator("[contenteditable=true]").fill("旧问题");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await page.getByRole("button", { name: "停止生成", exact: true }).click();
  await page.getByRole("button", { name: "开启新对话", exact: true }).click();
  await page.locator("[contenteditable=true]").fill("新问题");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText("当前回复", { exact: true })).toBeVisible();
  release();
  await expect(page.getByText("过期回复", { exact: true })).toHaveCount(0);
});
test("IME Enter does not submit, shift-enter adds newline", async ({ page }) => {
  let count = 0;
  await page.route("**/anthropic/v1/messages", (r) => {
    count++;
    return r.fulfill({ contentType: "text/event-stream", body: events("回复") });
  });
  const editor = page.locator("[contenteditable=true]");
  await editor.fill("拼音输入");
  await editor.dispatchEvent("compositionstart");
  await editor.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    isComposing: true,
    keyCode: 229,
  });
  expect(count).toBe(0);
  await editor.dispatchEvent("compositionend");
  await editor.press("Shift+Enter");
  await editor.press("a");
  expect(count).toBe(0);
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText("回复", { exact: true })).toBeVisible();
  expect(count).toBe(1);
});
test("delete all keeps settings and removes persistent chats", async ({ page }) => {
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({ contentType: "text/event-stream", body: events("待删除回复") }),
  );
  await page.locator("[contenteditable=true]").fill("删除测试");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText("待删除回复", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "设置", exact: true }).click();
  await page.getByRole("button", { name: "数据管理", exact: true }).click();
  await page.getByRole("button", { name: "删除", exact: true }).click();
  await page.getByRole("button", { name: "删除所有对话", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("删除成功");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.reload();
  await expect(page.getByText("今天有什么可以帮到你？", { exact: true })).toBeVisible();
  await expect(page.locator(".session-item")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("deepseek-vue-chat:api-key"))).toBe("test");
});
test("failed final import transaction preserves current history", async ({ page }) => {
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({ contentType: "text/event-stream", body: events("事务保护正文") }),
  );
  await page.locator("[contenteditable=true]").fill("保留原对话");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText("事务保护正文", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "设置", exact: true }).click();
  await page.getByRole("button", { name: "数据管理", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const zip = await (await download).path();
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    (window as any).importAbortCount = 0;
    IDBDatabase.prototype.transaction = function (...args: any[]) {
      const tx = original.apply(this, args as any);
      const names = Array.isArray(args[0]) ? args[0] : [args[0]];
      if (
        names.includes("sessions") &&
        names.includes("filesStaging") &&
        args[1] === "readwrite" &&
        !(window as any).importAbortCount
      ) {
        (window as any).importAbortCount++;
        queueMicrotask(() => tx.abort());
      }
      return tx;
    } as typeof original;
  });
  await page.locator('input[accept=".zip"]').setInputFiles(zip!);
  await page.getByRole("button", { name: "确认导入", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("导入失败");
  expect(await page.evaluate(() => (window as any).importAbortCount)).toBe(1);
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await expect(page.getByText("事务保护正文", { exact: true })).toBeVisible();
  await page.reload();
  await page.locator(".tr-history__item .text").first().click();
  await expect(page.getByText("事务保护正文", { exact: true })).toBeVisible();
});
