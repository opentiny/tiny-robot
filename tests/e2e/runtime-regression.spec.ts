import { test, expect, type Page } from "@playwright/test";
async function seed(page: Page) {
  await page.addInitScript(() => localStorage.setItem("deepseek-vue-chat:api-key", "test"));
  await page.goto("/");
  await expect(page.getByText("今天有什么可以帮到你？", { exact: true })).toBeVisible();
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const r = indexedDB.open("deepseek-vue-chat");
      r.onsuccess = () => {
        const db = r.result;
        const tx = db.transaction(["sessions", "sessionSummaries"], "readwrite");
        for (const id of ["A", "B", "C"]) {
          const u = {
            id: `${id}-user`,
            role: "user",
            content: `问题${id}`,
            files: [],
            createdAt: Date.now(),
            selectedChildId: `${id}-reply`,
            parentId: null,
          };
          const a = {
            id: `${id}-reply`,
            role: "assistant",
            createdAt: Date.now(),
            model: "deepseek-flash",
            status: "done",
            prefix: true,
            blocks: [{ type: "text", text: `回复${id}` }],
            parentId: u.id,
          };
          const s = {
            id,
            title: `会话${id}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            rootMessageId: u.id,
            messages: [u, a],
          };
          tx.objectStore("sessions").put(s);
          tx.objectStore("sessionSummaries").put({ ...s, messages: undefined, fileIds: [] });
        }
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      r.onerror = () => reject(r.error);
    });
  });
  await page.reload();
}
async function open(page: Page, id: string) {
  await page
    .locator(".tr-history__item .text")
    .filter({ hasText: `会话${id}` })
    .click();
  await expect(page.locator(".main-header")).toContainText(`会话${id}`);
  await expect(page.getByText(`回复${id}`, { exact: true })).toBeVisible();
}
async function delayA(page: Page) {
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.get;
    let delayed = false;
    IDBObjectStore.prototype.get = function (key) {
      const req = original.call(this, key);
      if (this.name === "sessions" && key === "A" && !delayed) {
        delayed = true;
        (window as any).delayedA = true;
        const add = req.addEventListener.bind(req);
        req.addEventListener = function (type: any, listener: any, options: any) {
          if (type === "success")
            return add(
              type,
              (event) =>
                setTimeout(
                  () =>
                    typeof listener === "function"
                      ? listener.call(req, event)
                      : listener.handleEvent(event),
                  700,
                ),
              options,
            );
          return add(type, listener, options);
        } as any;
      }
      return req;
    };
  });
}
test("slow earlier switch must not override a newer selected conversation", async ({ page }) => {
  await seed(page);
  await open(page, "B");
  await delayA(page);
  await page.locator(".tr-history__item .text").filter({ hasText: "会话A" }).click();
  await expect.poll(() => page.evaluate(() => (window as any).delayedA)).toBe(true);
  await open(page, "C");
  await page.waitForTimeout(1000);
  await expect(page.locator(".main-header")).toContainText("会话C");
  await expect(page.getByText("回复C", { exact: true })).toBeVisible();
});
test("new conversation must remain selected when older slow load completes", async ({ page }) => {
  await seed(page);
  await open(page, "B");
  await delayA(page);
  await page.locator(".tr-history__item .text").filter({ hasText: "会话A" }).click();
  await expect.poll(() => page.evaluate(() => (window as any).delayedA)).toBe(true);
  await page.getByRole("button", { name: "开启新对话", exact: true }).click();
  await page.waitForTimeout(1000);
  await expect(page.getByText("今天有什么可以帮到你？", { exact: true })).toBeVisible();
  await expect(page.locator(".message")).toHaveCount(0);
});
test("failed history read leaves the current conversation intact and allows retry", async ({
  page,
}) => {
  await seed(page);
  await open(page, "B");
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.get;
    let failed = false;
    IDBObjectStore.prototype.get = function (key) {
      if (this.name === "sessions" && key === "A" && !failed) {
        failed = true;
        throw new DOMException("Injected read failure", "UnknownError");
      }
      return original.call(this, key);
    };
  });
  await page.locator(".tr-history__item .text").filter({ hasText: "会话A" }).click();
  await page.waitForTimeout(300);
  await expect(page.locator(".main-header")).toContainText("会话B");
  await expect(page.getByText("回复B", { exact: true })).toBeVisible();
  await open(page, "A");
});
test("failed deletion must not undo a later new-chat navigation", async ({ page }) => {
  await seed(page);
  await open(page, "A");
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.get;
    let delayed = false;
    IDBObjectStore.prototype.get = function (key) {
      const req = original.call(this, key);
      if (this.name === "sessionSummaries" && key === "A" && !delayed) {
        delayed = true;
        (window as any).delayedDelete = true;
        const add = req.addEventListener.bind(req);
        req.addEventListener = function (type: any, listener: any, options: any) {
          if (type === "success")
            return add(
              type,
              (event) =>
                setTimeout(
                  () =>
                    typeof listener === "function"
                      ? listener.call(req, event)
                      : listener.handleEvent(event),
                  700,
                ),
              options,
            );
          return add(type, listener, options);
        } as any;
      }
      return req;
    };
  });
  const item = page.locator(".tr-history__item").filter({ hasText: "会话A" });
  await item.hover();
  await item.getByRole("button").click();
  await page.getByRole("menuitem", { name: "删除", exact: true }).click();
  await page.getByRole("button", { name: "删除", exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).delayedDelete)).toBe(true);
  await page.getByRole("button", { name: "开启新对话", exact: true }).click();
  await page.waitForTimeout(1000);
  await expect(page.getByText("今天有什么可以帮到你？", { exact: true })).toBeVisible();
  await expect(page.locator(".tr-history__item").filter({ hasText: "会话A" })).toHaveCount(1);
});
test("stop settles the visible reply and persists a stopped status", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("deepseek-vue-chat:api-key", "test"));
  await page.route("**/anthropic/v1/messages", async (route) => {
    await new Promise((r) => setTimeout(r, 2500));
    await route.abort().catch(() => {});
  });
  await page.goto("/");
  await page.locator("[contenteditable=true]").fill("测试停止");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.locator(".pending")).toBeVisible();
  await page.getByRole("button", { name: "停止生成", exact: true }).click();
  await expect(page.locator(".pending")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "重新生成", exact: true })).toBeEnabled();
  await page.waitForTimeout(400);
  await page.reload();
  await page.locator(".tr-history__item .text").first().click();
  await expect(page.locator(".pending")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "重新生成", exact: true })).toBeEnabled();
});
test("late duplicate initial history load must not erase a newly created conversation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("deepseek-vue-chat:api-key", "test");
    const original = IDBObjectStore.prototype.getAll;
    let reads = 0;
    IDBObjectStore.prototype.getAll = function (...args: any[]) {
      const req = original.apply(this, args as any);
      if (this.name === "sessionSummaries" && ++reads === 2) {
        (window as any).delayedInitialLoad = true;
        const add = req.addEventListener.bind(req);
        req.addEventListener = function (type: any, listener: any, options: any) {
          if (type === "success")
            return add(
              type,
              (event) =>
                setTimeout(
                  () =>
                    typeof listener === "function"
                      ? listener.call(req, event)
                      : listener.handleEvent(event),
                  1500,
                ),
              options,
            );
          return add(type, listener, options);
        } as any;
      }
      return req;
    };
  });
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({
      contentType: "text/event-stream",
      body: [
        { type: "message_start", message: { id: "init-answer", model: "deepseek-flash" } },
        {
          type: "content_block_start",
          index: 0,
          content_block: { type: "text", text: "首条回复" },
        },
        { type: "message_delta", delta: { stop_reason: "end_turn", title: "初始化审查" } },
        { type: "message_stop" },
      ]
        .map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`)
        .join(""),
    }),
  );
  await page.goto("/");
  await page.locator("[contenteditable=true]").fill("初始化期间发送");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText("首条回复", { exact: true })).toBeVisible();
  await page.waitForTimeout(1800);
  await expect(page.getByText("首条回复", { exact: true })).toBeVisible();
  await expect(page.locator(".tr-history__item")).toHaveCount(1);
});
test("an evicted engine pending save must not overwrite same-id imported history", async ({
  page,
}) => {
  await seed(page);
  await open(page, "A");
  await page.getByRole("button", { name: "设置", exact: false }).click();
  await page.getByRole("button", { name: "数据管理", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const archive = await (await pending).path();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.get;
    let delayed = false;
    IDBObjectStore.prototype.get = function (key) {
      const req = original.call(this, key);
      if (this.name === "sessions" && key === "A" && !delayed) {
        delayed = true;
        (window as any).delayedSave = true;
        const add = req.addEventListener.bind(req);
        req.addEventListener = function (type: any, listener: any, options: any) {
          if (type === "success")
            return add(
              type,
              (event) =>
                setTimeout(
                  () =>
                    typeof listener === "function"
                      ? listener.call(req, event)
                      : listener.handleEvent(event),
                  3000,
                ),
              options,
            );
          return add(type, listener, options);
        } as any;
      }
      return req;
    };
  });
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({
      contentType: "text/event-stream",
      body: [
        { type: "message_start", message: { id: "old-extra", model: "deepseek-flash" } },
        {
          type: "content_block_start",
          index: 0,
          content_block: { type: "text", text: "不应回写的旧回复" },
        },
        { type: "message_delta", delta: { stop_reason: "end_turn" } },
        { type: "message_stop" },
      ]
        .map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`)
        .join(""),
    }),
  );
  await page.locator("[contenteditable=true]").fill("不应回写的旧问题");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText("不应回写的旧回复", { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as any).delayedSave)).toBe(true);
  await open(page, "B");
  await page.getByRole("button", { name: "设置", exact: false }).click();
  await page.getByRole("button", { name: "数据管理", exact: true }).click();
  await page.locator('input[accept=".zip"]').setInputFiles(archive!);
  await page.getByRole("button", { name: "确认导入", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("已导入 3 个对话");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.waitForTimeout(3200);
  await page.reload();
  await open(page, "A");
  await expect(page.locator(".message")).toHaveCount(2);
  await expect(page.getByText("不应回写的旧问题", { exact: true })).toHaveCount(0);
  await page.locator("[contenteditable=true]").fill("导入后新消息");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.locator(".message")).toHaveCount(4);
  await page.waitForTimeout(500);
  await page.reload();
  await open(page, "A");
  await expect(page.getByText("导入后新消息", { exact: true })).toBeVisible();
  await expect(page.locator(".message")).toHaveCount(4);
});
test("a pending branch-only save cannot overwrite imported same-id branch selection", async ({
  page,
}) => {
  await seed(page);
  await open(page, "A");
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({
      contentType: "text/event-stream",
      body: [
        { type: "message_start", message: { id: "branch-answer", model: "deepseek-flash" } },
        {
          type: "content_block_start",
          index: 0,
          content_block: { type: "text", text: "分支回复" },
        },
        { type: "message_delta", delta: { stop_reason: "end_turn" } },
        { type: "message_stop" },
      ]
        .map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`)
        .join(""),
    }),
  );
  await page.getByRole("button", { name: "编辑消息", exact: true }).click();
  await page.getByRole("textbox", { name: "编辑消息", exact: true }).fill("归档所选分支");
  await page.getByRole("textbox", { name: "编辑消息", exact: true }).press("Enter");
  await expect(page.getByText("分支回复", { exact: true })).toBeVisible();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "设置", exact: false }).click();
  await page.getByRole("button", { name: "数据管理", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载", exact: true }).click();
  const archive = await (await pending).path();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.get;
    let delayed = false;
    IDBObjectStore.prototype.get = function (key) {
      const req = original.call(this, key);
      if (this.name === "sessions" && key === "A" && !delayed) {
        delayed = true;
        (window as any).delayedBranchSave = true;
        const add = req.addEventListener.bind(req);
        req.addEventListener = function (type: any, listener: any, options: any) {
          if (type === "success")
            return add(
              type,
              (event) =>
                setTimeout(
                  () =>
                    typeof listener === "function"
                      ? listener.call(req, event)
                      : listener.handleEvent(event),
                  3000,
                ),
              options,
            );
          return add(type, listener, options);
        } as any;
      }
      return req;
    };
  });
  await page.getByRole("button", { name: "上一个版本", exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as any).delayedBranchSave)).toBe(true);
  await open(page, "B");
  await page.getByRole("button", { name: "设置", exact: false }).click();
  await page.getByRole("button", { name: "数据管理", exact: true }).click();
  await page.locator('input[accept=".zip"]').setInputFiles(archive!);
  await page.getByRole("button", { name: "确认导入", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("已导入 3 个对话");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.waitForTimeout(3200);
  await page.reload();
  await page.locator(".tr-history__item .text").filter({ hasText: "会话A" }).click();
  await expect(page.getByText("归档所选分支", { exact: true })).toBeVisible();
  await expect(page.getByText("分支回复", { exact: true })).toBeVisible();
});
test("repeated initial-load retry must not overwrite a newly created conversation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("deepseek-vue-chat:api-key", "test");
    const original = IDBObjectStore.prototype.getAll;
    let reads = 0;
    IDBObjectStore.prototype.getAll = function (...args: any[]) {
      if (this.name !== "sessionSummaries") return original.apply(this, args as any);
      const nth = ++reads;
      (window as any).initialReadCount = reads;
      if (nth === 1) throw new DOMException("Injected initial read failure", "UnknownError");
      const req = original.apply(this, args as any);
      if (nth === 2 || nth === 3) {
        const add = req.addEventListener.bind(req);
        req.addEventListener = function (type: any, listener: any, options: any) {
          if (type === "success")
            return add(
              type,
              (event) =>
                setTimeout(
                  () =>
                    typeof listener === "function"
                      ? listener.call(req, event)
                      : listener.handleEvent(event),
                  nth === 2 ? 500 : 1500,
                ),
              options,
            );
          return add(type, listener, options);
        } as any;
      }
      return req;
    };
  });
  await page.route("**/anthropic/v1/messages", (r) =>
    r.fulfill({
      contentType: "text/event-stream",
      body: [
        { type: "message_start", message: { id: "retry-answer", model: "deepseek-flash" } },
        {
          type: "content_block_start",
          index: 0,
          content_block: { type: "text", text: "重试成功后的回答" },
        },
        { type: "message_delta", delta: { stop_reason: "end_turn", title: "重试审查" } },
        { type: "message_stop" },
      ]
        .map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`)
        .join(""),
    }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "重试", exact: true })
    .evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
  await page.waitForTimeout(700);
  await page.locator("[contenteditable=true]").fill("重试后发送");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.getByText("重试成功后的回答", { exact: true })).toBeVisible();
  await page.waitForTimeout(1800);
  await expect(page.getByText("重试成功后的回答", { exact: true })).toBeVisible();
  await expect(page.locator(".tr-history__item")).toHaveCount(1);
  expect(await page.evaluate(() => (window as any).initialReadCount)).toBe(2);
});
