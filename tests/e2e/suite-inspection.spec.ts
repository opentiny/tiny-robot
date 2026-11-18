import { test, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";
const out = process.env.ARTIFACT_DIR || "test-results/evidence";
test("Chat suite built-in regions and visual inspection", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => localStorage.setItem("deepseek-vue-chat:api-key", "test"));
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({
      contentType: "text/event-stream",
      body: [
        { type: "message_start", message: { id: "suite-test", model: "deepseek-flash" } },
        {
          type: "content_block_start",
          index: 0,
          content_block: {
            type: "text",
            text: '这是 Chat 套件版本。\n\n```javascript\nconst chat = "TinyRobot"\n```\n\n公式 $x^2$\n\n```mermaid\ngraph LR\nA-->B\n```',
          },
        },
        { type: "content_block_stop", index: 0 },
        {
          type: "message_delta",
          delta: { stop_reason: "end_turn", stop_sequence: null, title: "套件验证" },
        },
        { type: "message_stop" },
      ]
        .map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`)
        .join(""),
    }),
  );
  await page.goto("/");
  await expect(page.locator(".tr-chat-ui")).toBeVisible();
  await page.screenshot({ path: `${out}/suite-desktop-home.png` });
  await page.locator("[contenteditable=true]").fill("你好，介绍一下这个版本");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.locator(".diagram .nodeLabel").filter({ hasText: /^A$/ })).toBeVisible();
  await expect(page.locator(".tr-chat-messages__bubble-list")).toBeVisible();
  await expect(page.locator(".chat-left-aside-history")).toBeVisible();
  const headerGeometry = await page.locator(".main-header > span").evaluate((el) => {
    const result = [];
    for (let item: Element | null = el; item; item = item.parentElement) {
      const style = getComputedStyle(item);
      result.push({ tag: item.tagName, class: item.className, y: item.getBoundingClientRect().y, height: item.getBoundingClientRect().height, scroll: item.scrollTop, overflow: style.overflow, lineHeight: style.lineHeight });
    }
    return result;
  });
  writeFileSync(`${out}/header-geometry.json`, JSON.stringify(headerGeometry, null, 2));
  await page.screenshot({ path: `${out}/suite-desktop-conversation.png` });
  writeFileSync(
    `${out}/suite-dom.json`,
    JSON.stringify(
      await page.evaluate(() => ({
        history: document.querySelector(".chat-left-aside-history")?.outerHTML,
        composer: document.querySelector(".tr-sender")?.className,
        scrollRegions: [...document.querySelectorAll("*")]
          .filter((e) => getComputedStyle(e).overflowY === "auto")
          .map((e) => ({ class: e.className, height: e.clientHeight, scroll: e.scrollHeight })),
        messages: [...document.querySelectorAll(".message")].map((e) => ({
          class: e.className,
          width: e.getBoundingClientRect().width,
        })),
      })),
      null,
      2,
    ),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "发送", exact: true })).toBeInViewport();
  await page.getByRole("button", { name: "打开边栏", exact: true }).click();
  await page.locator(".chat-left-aside-history").getByText("套件验证", { exact: true }).click();
  await expect
    .poll(() =>
      page.locator(".chat-main-scroll-host").evaluate((el) => el.getBoundingClientRect().x),
    )
    .toBe(0);
  expect(await page.locator(".tr-layout__body").evaluate((el) => el.scrollLeft)).toBe(0);
  await page.waitForTimeout(300);
  writeFileSync(
    `${out}/mobile-dom.json`,
    JSON.stringify(
      await page.evaluate(() => ({
        body: document.body.innerHTML.slice(-2000),
        rects: [
          ...document.querySelectorAll(
            ".tr-layout,.chat-main-scroll-host,.tr-sender,.tr-bubble__container,.tr-bubble__content,.tr-bubble__body,.tr-bubble__box",
          ),
        ].map((e) => ({
          class: e.className,
          rect: e.getBoundingClientRect().toJSON(),
          width: getComputedStyle(e).maxWidth,
        })),
      })),
      null,
      2,
    ),
  );
  await page.screenshot({ path: `${out}/suite-mobile-conversation.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(errors).toEqual([]);
});
