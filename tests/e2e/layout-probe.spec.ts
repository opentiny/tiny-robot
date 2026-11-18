import { test, expect } from "@playwright/test";
test("short user text stays on one line and assistant uses the content column", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("deepseek-vue-chat:api-key", "test"));
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({
      contentType: "text/event-stream",
      body: [
        { type: "message_start", message: { id: "m", model: "deepseek-flash" } },
        { type: "content_block_start", index: 0, content_block: { type: "text", text: "回答" } },
        { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null } },
        { type: "message_stop" },
      ]
        .map((e) => `data: ${JSON.stringify(e)}\n\n`)
        .join(""),
    }),
  );
  await page.goto("/");
  await page.locator("[contenteditable=true]").fill("问题");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText("回答", { exact: true })).toBeVisible();
  const box = await page.locator(".user-text").boundingBox();
  expect(box!.height).toBeLessThan(50);
  const body = await page.locator(".message.assistant").boundingBox();
  expect(body!.width).toBeGreaterThan(700);
  await expect(page.locator(".tr-sender-submit-button")).toBeHidden();
});
