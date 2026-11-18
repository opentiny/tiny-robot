import { test, expect } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
const enabled = process.env.LIVE_API_TEST === "1";
test.skip(!enabled, "Explicit live API test only; needs user-authorized local credentials");
test.use({
  screenshot: "off",
  trace: "off",
  video: "off",
  launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] },
});
test("real DeepSeek text, search, read-link, image, ASR and TTS", async ({ page, context }) => {
  test.setTimeout(240000);
  const env = readFileSync(process.env.DEEPSEEK_ENV_FILE || "../.env", "utf8");
  const match = env.match(/^\s*(?:export\s+)?DEEPSEEK_API_KEY\s*=\s*(.*?)\s*$/m);
  const key = match?.[1]?.replace(/^(['"])(.*)\1$/, "$2");
  if (!key) throw new Error("Local DEEPSEEK_API_KEY is missing");
  await context.addInitScript((value) => localStorage.setItem("deepseek-vue-chat:api-key", value), key);
  const records: { path: string; status: number; blocks?: unknown[] }[] = [];
  const pending: Promise<void>[] = [];
  page.on("response", (res) => {
    if (res.url().startsWith("https://api.deepseek.com/")) {
      const record: (typeof records)[number] = {
        path: new URL(res.url()).pathname,
        status: res.status(),
      };
      records.push(record);
      if (res.url().endsWith("/messages"))
        pending.push(
          res
            .text()
            .then((body) => {
              record.blocks = body
                .split("\n")
                .filter((line) => line.startsWith("data:"))
                .flatMap((line) => {
                  try {
                    const event = JSON.parse(line.slice(5));
                    const block = event.content_block;
                    return block
                      ? [
                          {
                            type: block.type,
                            name: block.name,
                            kind: block.kind,
                            action: block.input?.action,
                          },
                        ]
                      : [];
                  } catch {
                    return [];
                  }
                });
            })
            .catch(() => {}),
        );
    }
  });
  const report: any = { startedAt: new Date().toISOString(), checks: [], requests: records };
  try {
    await page.goto("/");
    const verification = await page.evaluate(async () => {
      const r = await fetch("https://api.deepseek.com/models", {
        headers: { Authorization: `Bearer ${localStorage.getItem("deepseek-vue-chat:api-key")}` },
      });
      return r.status;
    });
    expect(verification).toBe(200);
    report.checks.push({ name: "models/key and browser CORS", passed: true });
    async function ask(prompt: string) {
      await page.locator("[contenteditable=true]").fill(prompt);
      await page.getByRole("button", { name: "发送", exact: true }).click();
      await expect(page.locator(".assistant .markdown").last()).not.toBeEmpty({ timeout: 90000 });
      await expect(page.getByRole("button", { name: "停止生成", exact: true })).toHaveCount(0, {
        timeout: 90000,
      });
      await expect(page.locator(".reply > .error")).toHaveCount(0);
      await Promise.all(pending);
      const structure = await page.evaluate(async () => {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open("deepseek-vue-chat");
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(new Error("Unable to read validation state"));
        });
        const sessions = await new Promise<any[]>((resolve, reject) => {
          const request = db.transaction("sessions").objectStore("sessions").getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(new Error("Unable to read validation state"));
        });
        db.close();
        return sessions
          .flatMap((s) => s.messages)
          .filter((m) => m.role === "assistant")
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 1)
          .map((m) => ({
            thinking: m.thinking,
            search: m.search,
            status: m.status,
            blocks: m.blocks.map((b: any) => ({
              type: b.type,
              name: b.name,
              kind: b.kind,
              action: b.input?.action,
            })),
          }));
      });
      report.checks.push({ name: "persisted response structure", structure });
      return (await page.locator(".assistant .markdown").last().innerText()).slice(0, 300);
    }
    if (!process.env.LIVE_API_PHASE) {
      report.checks.push({ name: "text", answer: await ask("请只回复：连接验证成功。") });
      const speech = page.waitForResponse((r) => r.url().endsWith("/v1/tools/tts"));
      await page.getByRole("button", { name: "朗读", exact: true }).last().click();
      expect((await speech).status()).toBe(200);
      report.checks.push({ name: "TTS", passed: true });
      const stop = page.getByRole("button", { name: "停止朗读", exact: true });
      if (await stop.count()) await stop.click();
      await page.getByRole("button", { name: "开启新对话", exact: true }).click();
      await page.getByRole("button", { name: "智能搜索", exact: true }).click();
      report.checks.push({
        name: "search",
        answer: await ask(
          "请联网查找 DeepSeek 2026年11月13日发布的全家桶应用 API 官方说明，只给出一句摘要与来源链接。",
        ),
      });
      report.checks.push({
        name: "search citation count",
        count: await page.locator("a.citation").count(),
      });
      await page.getByRole("button", { name: "开启新对话", exact: true }).click();
      await page.getByRole("button", { name: "智能搜索", exact: true }).click();
      report.checks.push({
        name: "read-link",
        answer: await ask(
          "请阅读 https://api-docs.deepseek.com/zh-cn/news/news261113 并用一句话总结。",
        ),
      });
    }
    await page.getByRole("button", { name: "开启新对话", exact: true }).click();
    if (process.env.LIVE_API_PHASE === "tools") {
      await page.getByRole("button", { name: "深度思考", exact: true }).click();
      await page.getByRole("button", { name: "智能搜索", exact: true }).click();
      report.checks.push({
        name: "deep search",
        answer: await ask("请搜索DeepSeek官网，告诉我2026年11月13日全家桶API公告的标题。"),
      });
      await page.getByRole("button", { name: "开启新对话", exact: true }).click();
      await page.getByRole("button", { name: "智能搜索", exact: true }).click();
      await page.getByRole("button", { name: "深度思考", exact: true }).click();
      report.checks.push({
        name: "read link",
        answer: await ask(
          "请使用阅读链接工具打开 https://api-docs.deepseek.com/zh-cn/news/news261113 并用一句话总结页面。",
        ),
      });
    } else {
      const png = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = "black";
        ctx.font = "36px sans-serif";
        ctx.fillText("Vue verification 42", 40, 130);
        return canvas.toDataURL("image/png").split(",")[1]!;
      });
      await page.locator(".suite-app > input[type=file]").setInputFiles({
        name: "verification.png",
        mimeType: "image/png",
        buffer: Buffer.from(png, "base64"),
      });
      await expect(page.getByRole("button", { name: "发送", exact: true })).toBeEnabled({
        timeout: 30000,
      });
      report.checks.push({
        name: "image upload and message",
        answer: await ask("请读出图片上的文字。"),
      });
      await page.getByRole("button", { name: "开启新对话", exact: true }).click();
      await page.getByRole("button", { name: "深度思考", exact: true }).click();
      report.checks.push({ name: "thinking", answer: await ask("17乘以19是多少？简短回答。") });
      await context.grantPermissions(["microphone"]);
      await page.getByRole("button", { name: "语音输入", exact: true }).click();
      await expect(page.locator(".recording")).toContainText(/录音中 [1-9]\d*s/);
      const asr = page.waitForResponse((r) => r.url().endsWith("/v1/tools/asr"));
      await page.getByRole("button", { name: "结束录音并转写", exact: true }).click();
      const response = await asr;
      report.checks.push({
        name: "ASR browser recorded WAV (synthetic microphone)",
        status: response.status(),
      });
      expect(response.status()).toBe(200);
    }
    await Promise.all(pending);
    report.passed = true;
  } catch (error) {
    report.passed = false;
    report.failure =
      error instanceof Error ? error.message.replaceAll(key, "[REDACTED]") : String(error);
    throw new Error(report.failure);
  } finally {
    await Promise.all(pending);
    report.finishedAt = new Date().toISOString();
    writeFileSync(
      process.env.LIVE_API_REPORT || "test-results/live-api-results.json",
      JSON.stringify(report, null, 2),
    );
  }
});
