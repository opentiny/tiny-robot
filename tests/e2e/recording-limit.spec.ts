import { test, expect } from "@playwright/test";
test.skip(process.env.LONG_AUDIO_TEST !== "1", "Opt-in 120-second recorder limit check");
test.use({
  launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] },
});
test("recording automatically stops at 120 seconds and submits bounded WAV once", async ({
  page,
  context,
}) => {
  test.setTimeout(150000);
  let calls = 0,
    bytes = 0;
  await context.grantPermissions(["microphone"]);
  await page.addInitScript(() => localStorage.setItem("deepseek-vue-chat:api-key", "test"));
  await page.route("**/v1/tools/asr", (r) => {
    calls++;
    const body = r.request().postDataBuffer()!;
    const riff = body.indexOf(Buffer.from("RIFF"));
    expect(riff).toBeGreaterThan(-1);
    bytes = body.readUInt32LE(riff + 40);
    return r.fulfill({ json: { text: "录音上限验证" } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "语音输入", exact: true }).click();
  await expect(page.locator(".recording")).toBeVisible();
  await expect(page.locator("[contenteditable=true]")).toContainText("录音上限验证", {
    timeout: 135000,
  });
  expect(calls).toBe(1);
  expect(bytes).toBe(120 * 16000 * 2);
  await expect(page.locator(".recording")).toHaveCount(0);
});
