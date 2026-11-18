import { test, expect } from "@playwright/test";
import path from "node:path";
import { readFileSync } from "node:fs";
import { unzipSync } from "fflate";
const text = "双向归档互操作正文";
const events = [
  { type: "message_start", message: { id: "interop", model: "deepseek-flash" } },
  { type: "content_block_start", index: 0, content_block: { type: "text", text } },
  { type: "content_block_stop", index: 0 },
  {
    type: "message_delta",
    delta: { stop_reason: "end_turn", stop_sequence: null, title: "互操作测试" },
  },
  { type: "message_stop" },
];
const body = events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join("");
test("upstream ZIP -> Vue -> upstream preserves image bytes and message branches", async ({
  context,
  page,
}) => {
  await context.addInitScript(() => {
    localStorage.setItem("chat-demo:api-key", "test");
    localStorage.setItem("deepseek-vue-chat:api-key", "test");
    localStorage.setItem("chat-demo:locale", "zh-CN");
    localStorage.setItem("deepseek-vue-chat:locale", "zh-CN");
  });
  await context.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({ contentType: "text/event-stream", body }),
  );
  await context.route("**/anthropic/v1/files", (r) =>
    r.fulfill({
      json: {
        id: "file-image",
        type: "file",
        filename: "sample.png",
        mime_type: "image/png",
        size_bytes: 68,
      },
    }),
  );
  await page.goto("http://127.0.0.1:8090");
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles({
      name: "sample.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF9sAAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await page.getByPlaceholder("请输入消息", { exact: true }).fill("归档问题");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText(text, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "重新生成", exact: true }).click();
  await expect(page.getByText("2 / 2", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "设置", exact: true }).click();
  await page.getByRole("tab", { name: "数据管理", exact: true }).click();
  const firstDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const zip = await (await firstDownload).path();
  const vue = await context.newPage();
  await vue.goto("/");
  await vue.getByRole("button", { name: "设置", exact: true }).click();
  await vue.getByRole("button", { name: "数据管理", exact: true }).click();
  await vue.locator('input[accept=".zip"]').setInputFiles(zip!);
  await vue.getByRole("button", { name: "确认导入", exact: true }).click();
  await expect(vue.getByRole("status")).toContainText("已导入 1 个对话");
  const secondDownload = vue.waitForEvent("download");
  await vue.getByRole("button", { name: "下载", exact: true }).click();
  const zip2 = await (await secondDownload).path();
  const firstArchive = unzipSync(readFileSync(zip!)),
    secondArchive = unzipSync(readFileSync(zip2!));
  const imagePaths = Object.keys(firstArchive).filter((name) => /\.(png|jpg|webp)$/.test(name));
  expect(imagePaths.length).toBe(1);
  for (const imagePath of imagePaths)
    expect(secondArchive[imagePath]).toEqual(firstArchive[imagePath]);
  await vue.getByRole("button", { name: "关闭", exact: true }).click();
  await vue.locator(".chat-left-aside-history").getByText("互操作测试", { exact: true }).click();
  await expect(vue.getByText(text, { exact: true })).toBeVisible();
  await expect(vue.getByText("2 / 2", { exact: true })).toBeVisible();
  await expect(vue.locator(".history-file.image img")).toBeVisible();
  await vue.getByRole("button", { name: "上一个版本", exact: true }).click();
  await expect(vue.getByText("1 / 2", { exact: true })).toBeVisible();
  await page.locator("input[type=file]").last().setInputFiles(zip2!);
  await page.getByRole("button", { name: "确认导入", exact: true }).click();
  await expect(page.getByText("已导入 1 个对话", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.getByText("互操作测试", { exact: true }).click();
  await expect(page.getByText(text, { exact: true })).toBeVisible();
  await expect(page.getByText("2 / 2", { exact: true })).toBeVisible();
});
test("downloaded production index works over file protocol including lazy chunks", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`file://${path.resolve("dist/index.html")}`);
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await expect(page.getByText("今天有什么可以帮到你？")).toBeVisible();
  await page.getByRole("button", { name: "MCP / Skills", exact: false }).click();
  await expect(page.getByRole("heading", { name: "扩展管理" })).toBeVisible();
  expect(errors).toEqual([]);
});
