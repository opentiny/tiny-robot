import { test, expect } from "@playwright/test";
const artifacts = process.env.ARTIFACT_DIR || "test-results/evidence";
test("Vue page renders and settings persist", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await expect(page.getByText("今天有什么可以帮到你？")).toBeVisible();
  await expect(page.getByRole("button", { name: "设置", exact: false })).toBeVisible();
  await page.screenshot({ path: `${artifacts}/vue-home.png` });
  await page.getByRole("button", { name: "设置", exact: false }).click();
  await expect(page.getByLabel("API Key", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "通用设置", exact: true }).click();
  await page.getByRole("button", { name: "深色", exact: true }).click();
  await expect(page.locator("body")).toHaveAttribute("data-ds-dark-theme", "");
  await page.screenshot({ path: `${artifacts}/vue-settings-dark.png` });
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.reload();
  await expect(page.locator("body")).toHaveAttribute("data-ds-dark-theme", "");
  expect(errors).toEqual([]);
});
test("reference homepage", async ({ page }) => {
  await page.goto("http://127.0.0.1:8090");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await expect(page.getByText("今天有什么可以帮到你？")).toBeVisible();
  await page.screenshot({ path: `${artifacts}/reference-home.png` });
});
test("settings dropdowns preserve locale, voice and location; Escape closes only the menu", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("deepseek-vue-chat:api-key", "test"));
  await page.goto("/");
  await page.getByRole("button", { name: "设置", exact: true }).click();
  await page.getByRole("button", { name: "语言", exact: true }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "朗读音色", exact: true }).click();
  await page.getByRole("menuitem", { name: "暗潮（男声）", exact: true }).click();
  await page.getByRole("button", { name: "请选择省份/地区", exact: true }).click();
  await page.getByRole("menuitem", { name: "广东省", exact: true }).click();
  await page.getByRole("button", { name: "请选择市", exact: true }).click();
  await page.getByRole("menuitem", { name: "深圳市", exact: true }).click();
  await page.getByRole("button", { name: "语言", exact: true }).click();
  await page.getByRole("menuitem", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await expect(page.getByText("How can I help you?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByText("深圳市", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("deepseek-vue-chat:tts-voice"))).toBe(
    "tide",
  );
});
