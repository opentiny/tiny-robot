import { test, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";
const directory = process.env.ARTIFACT_DIR || "test-results/evidence";
for (const size of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  for (const theme of ["light", "dark"])
    test(`visual evidence ${size.name} ${theme}`, async ({ browser }) => {
      const geometry: Record<string, unknown> = {};
      for (const [name, origin, prefix] of [
        ["reference", "http://127.0.0.1:8090", "chat-demo"],
        ["vue", "http://127.0.0.1:8095", "deepseek-vue-chat"],
      ]) {
        const context = await browser.newContext({
          viewport: { width: size.width, height: size.height },
          locale: "zh-CN",
        });
        await context.addInitScript(
          ({ prefix, theme }) => {
            localStorage.setItem(`${prefix}:api-key`, "test");
            localStorage.setItem(`${prefix}:theme-preference`, theme);
            localStorage.setItem(`${prefix}:locale`, "zh-CN");
          },
          { prefix, theme },
        );
        const page = await context.newPage();
        await page.goto(origin);
        await expect(page.getByText("今天有什么可以帮到你？")).toBeVisible();
        await page.screenshot({
          path: `${directory}/${name}-${size.name}-${theme}-home.png`,
          animations: "disabled",
        });
        geometry[name] = await page.getByText("今天有什么可以帮到你？").boundingBox();
        if (size.name === "mobile")
          await page.getByRole("button", { name: "打开边栏", exact: true }).click();
        await page.getByRole("button", { name: "设置", exact: true }).click();
        await page.screenshot({
          path: `${directory}/${name}-${size.name}-${theme}-settings.png`,
          animations: "disabled",
        });
        await context.close();
      }
      writeFileSync(
        `${directory}/geometry-${size.name}-${theme}.json`,
        JSON.stringify(geometry, null, 2),
      );
    });
}
