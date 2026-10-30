import { expect, test, type Locator, type Page } from '@playwright/test';

interface RuntimeStateHost extends HTMLElement {
  getRuntime():
    | {
        activeConversation: { value?: { requestState?: string } | null };
      }
    | undefined;
}

function chat(page: Page): Locator {
  return page.getByTestId('tr-chat');
}

function editor(page: Page): Locator {
  return chat(page).locator('.tr-sender-editor');
}

async function openFreshApp(page: Page): Promise<string[]> {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  await expect(page.getByTestId('ready-state')).toContainText('ready');
  return consoleErrors;
}

async function sendFromComposer(page: Page, text: string): Promise<void> {
  await editor(page).fill(text);
  await chat(page).locator('.tr-sender-submit-button').click();
}

test('renders an application shell, welcome state, and bounded 390px layout', async ({ page }) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await expect(page.getByRole('heading', { name: 'TrChat 应用级验证' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: '搜索会话' })).toBeVisible();
  await expect(page.getByRole('button', { name: '新建会话' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: '打开示例设置' })).toBeVisible();
  await expect(element.getByText('欢迎使用 TrChat')).toBeVisible();
  await expect(element.locator('.tr-chat-ui')).toBeVisible();
  await expect(element.locator('.tr-layout__body')).toHaveCSS('display', 'grid');
  await expect(element.locator('.tr-sender')).toHaveCSS('display', 'flex');

  await page.setViewportSize({ width: 390, height: 844 });
  const narrowGeometry = await element.evaluate((host) => {
    const layout = host.querySelector<HTMLElement>('.tr-layout');
    const main = host.querySelector<HTMLElement>('.tr-layout__main');
    if (!layout || !main) throw new Error('Expected TrChat layout and main region');

    const hostRect = host.getBoundingClientRect();
    const layoutRect = layout.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    return {
      hostLeft: hostRect.left,
      hostRight: hostRect.right,
      layoutLeft: layoutRect.left,
      layoutRight: layoutRect.right,
      mainLeft: mainRect.left,
      mainRight: mainRect.right,
      hostHeight: hostRect.height,
      layoutHeight: layoutRect.height,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  expect(narrowGeometry.layoutLeft).toBeGreaterThanOrEqual(narrowGeometry.hostLeft);
  expect(narrowGeometry.layoutRight).toBeLessThanOrEqual(narrowGeometry.hostRight);
  expect(narrowGeometry.mainLeft).toBeGreaterThanOrEqual(narrowGeometry.hostLeft);
  expect(narrowGeometry.mainRight).toBeLessThanOrEqual(narrowGeometry.hostRight);
  expect(narrowGeometry.hostHeight).toBeGreaterThanOrEqual(600);
  expect(narrowGeometry.layoutHeight).toBeGreaterThanOrEqual(600);
  expect(narrowGeometry.documentWidth).toBeLessThanOrEqual(narrowGeometry.viewportWidth);
  const senderActionGeometry = await element.evaluate((host) => {
    const sender = host.querySelector<HTMLElement>('.tr-sender');
    const attachment = host.querySelector<HTMLElement>('button[aria-label="添加附件"]');
    if (!sender || !attachment) throw new Error('Expected Sender and attachment action');
    const senderRect = sender.getBoundingClientRect();
    const attachmentRect = attachment.getBoundingClientRect();
    return { senderRight: senderRect.right, attachmentRight: attachmentRect.right };
  });
  expect(senderActionGeometry.attachmentRight).toBeLessThanOrEqual(
    senderActionGeometry.senderRight,
  );

  const drawerToggle = element.getByRole('button', { name: '展开会话列表', exact: true });
  await expect(drawerToggle).toHaveAttribute('aria-expanded', 'false');
  await drawerToggle.click();
  const drawer = element.getByRole('dialog', { name: '收起会话列表' });
  await expect(drawer).toBeVisible();
  const drawerId = await drawer.getAttribute('id');
  await expect
    .poll(() =>
      page.evaluate(
        (id) => document.activeElement?.closest<HTMLElement>('[role="dialog"]')?.id === id,
        drawerId,
      ),
    )
    .toBe(true);
  await page.keyboard.press('Escape');
  await expect(element.getByRole('button', { name: '展开会话列表', exact: true })).toBeFocused();
  await expect(drawer).toBeHidden();
  expect(consoleErrors).toEqual([]);
});

test('starts with the conversation drawer closed on a direct narrow-screen visit', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await expect(element.getByRole('button', { name: '展开会话列表', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await expect(element.getByRole('dialog', { name: '收起会话列表' })).toBeHidden();
  await expect(element.getByText('欢迎使用 TrChat')).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('keeps the chat usable under representative Angular global style pollution', async ({
  page,
}) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);
  const layout = element.locator('.tr-layout');
  const sender = element.locator('.tr-sender');
  const internalButton = element.getByRole('button', { name: '新建会话', exact: true }).first();
  const initialGeometry = await layout.boundingBox();

  await page.getByRole('button', { name: '启用宿主样式压力', exact: true }).click();
  await expect(page.locator('app-root')).toHaveAttribute('data-style-stress', 'enabled');
  await expect(page.getByTestId('style-boundary-status')).toHaveText('宿主样式压力：已启用');
  await expect(element.locator('.tr-layout__body')).toHaveCSS('display', 'grid');
  await expect(sender).toHaveCSS('display', 'flex');
  await expect(internalButton).toBeVisible();

  const stressedGeometry = await layout.boundingBox();
  expect(initialGeometry).not.toBeNull();
  expect(stressedGeometry).not.toBeNull();
  expect(Math.abs(stressedGeometry!.width - initialGeometry!.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(stressedGeometry!.height - initialGeometry!.height)).toBeLessThanOrEqual(2);

  const boundary = await element.evaluate((host) => {
    const button = host.querySelector<HTMLElement>('.tr-icon-button');
    const title = host.querySelector<HTMLElement>('.chat-header__title');
    const body = host.querySelector<HTMLElement>('.tr-layout__body');
    if (!button || !title || !body) throw new Error('Expected styled TrChat controls');
    const buttonStyle = getComputedStyle(button);
    const titleStyle = getComputedStyle(title);
    const bodyStyle = getComputedStyle(body);
    return {
      buttonPaddingTop: Number.parseFloat(buttonStyle.paddingTop),
      buttonBorderWidth: Number.parseFloat(buttonStyle.borderTopWidth),
      buttonFontSize: Number.parseFloat(buttonStyle.fontSize),
      titleMarginTop: Number.parseFloat(titleStyle.marginTop),
      bodyBoxSizing: bodyStyle.boxSizing,
    };
  });

  expect(boundary.buttonPaddingTop).toBeLessThanOrEqual(8);
  expect(boundary.buttonBorderWidth).toBeLessThanOrEqual(1);
  expect(boundary.buttonFontSize).toBeLessThanOrEqual(20);
  expect(boundary.titleMarginTop).toBe(0);
  expect(boundary.bodyBoxSizing).toBe('border-box');

  await editor(page).fill('样式压力下仍可输入');
  await expect(editor(page)).toHaveText('样式压力下仍可输入');
  expect(consoleErrors).toEqual([]);
});

test('sends from the real composer with model features and can stop streaming', async ({
  page,
}) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);
  const thinking = element.getByRole('button', { name: '深度思考' });
  const search = element.getByRole('button', { name: '智能搜索' });

  await thinking.click();
  await search.click();
  await expect(thinking).toHaveAttribute('aria-pressed', 'true');
  await expect(search).toHaveAttribute('aria-pressed', 'true');

  await sendFromComposer(page, '验证 Angular 应用发送');
  const messageLog = element.getByRole('log');
  await expect(messageLog).toHaveAttribute('aria-live', 'polite');
  await expect(messageLog).toHaveAttribute('aria-busy', 'true');
  await expect(element.locator('.tr-bubble[data-role="user"]')).toContainText(
    '验证 Angular 应用发送',
  );
  await expect(element.locator('.tr-bubble[data-role="assistant"]')).toContainText(
    '深度思考：开启',
  );
  await expect(element.locator('.tr-bubble[data-role="assistant"]')).toContainText(
    '智能搜索：开启',
  );
  await expect(element.locator('.tr-bubble[data-role="assistant"]')).toContainText(
    '已收到：验证 Angular 应用发送',
  );
  await expect
    .poll(() =>
      element.evaluate(
        (host: RuntimeStateHost) => host.getRuntime()?.activeConversation.value?.requestState,
      ),
    )
    .toBe('completed');
  await expect(messageLog).toHaveAttribute('aria-busy', 'false');

  await sendFromComposer(page, '请生成一个需要停止的长回答');
  await expect(element.locator('.tr-sender-submit-button')).toHaveClass(/is-loading/);
  await expect(element.locator('.tr-bubble[data-role="assistant"]').last()).toContainText('确定性');
  await element.locator('.tr-sender-submit-button').click();
  await expect
    .poll(() =>
      element.evaluate(
        (host: RuntimeStateHost) => host.getRuntime()?.activeConversation.value?.requestState,
      ),
    )
    .toBe('aborted');
  expect(consoleErrors).toEqual([]);
});

test('creates, switches, renames, deletes, and searches conversations', async ({ page }) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await sendFromComposer(page, 'Alpha project plan');
  await expect(element.locator('.tr-bubble[data-role="assistant"]')).toContainText('模拟回答完成');
  await expect
    .poll(() =>
      element.evaluate(
        (host: RuntimeStateHost) => host.getRuntime()?.activeConversation.value?.requestState,
      ),
    )
    .toBe('completed');
  await page.getByTestId('new-conversation').click();
  await expect(element.getByText('欢迎使用 TrChat')).toBeVisible();

  await sendFromComposer(page, 'Beta release notes');
  await expect(element.locator('.tr-bubble[data-role="assistant"]')).toContainText('模拟回答完成');
  const alphaItem = element.locator('.tr-history__item').filter({ hasText: 'Alpha project plan' });
  const betaItem = element.locator('.tr-history__item').filter({ hasText: 'Beta release notes' });
  await expect(alphaItem).toBeVisible();
  await expect(betaItem).toBeVisible();

  await alphaItem.click();
  await expect(element.locator('.tr-bubble[data-role="user"]')).toContainText('Alpha project plan');

  const searchbox = page.getByRole('searchbox', { name: '搜索会话' });
  await searchbox.fill('Alpha');
  await expect(element.locator('.tr-history__item')).toHaveCount(1);
  const filteredAlphaItem = element
    .locator('.tr-history__item')
    .filter({ hasText: 'Alpha project plan' });
  const alphaMenu = filteredAlphaItem.getByRole('button', { name: 'Alpha project plan 更多操作' });
  await alphaMenu.focus();
  await alphaMenu.press('ArrowDown');
  await element.getByRole('menuitem', { name: '重命名' }).click();
  await expect(searchbox).toHaveValue('');
  const renameEditor = element.locator('.tr-history').getByRole('textbox');
  await renameEditor.fill('Renamed Alpha');
  await renameEditor.press('Enter');
  await expect(
    element.locator('.tr-history__item').filter({ hasText: 'Renamed Alpha' }),
  ).toBeVisible();

  await searchbox.fill('Beta');
  const currentBetaItem = element
    .locator('.tr-history__item')
    .filter({ hasText: 'Beta release notes' });
  await expect(currentBetaItem).toBeVisible();
  await expect(element.locator('.tr-history__item')).toHaveCount(1);
  const betaMenu = currentBetaItem.getByRole('button', { name: 'Beta release notes 更多操作' });
  await betaMenu.focus();
  await betaMenu.press('ArrowDown');
  await element.getByRole('menuitem', { name: '删除' }).click();
  await expect(searchbox).toHaveValue('');
  await expect(currentBetaItem).toHaveCount(0);

  await searchbox.fill('Renamed');
  await page.getByTestId('new-conversation').click();
  await expect(searchbox).toHaveValue('');
  await expect(element.getByText('欢迎使用 TrChat')).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('groups history through the repository and recovers from a simulated page failure', async ({
  page,
}) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await sendFromComposer(page, 'Repository grouped conversation');
  await expect(element.locator('.tr-bubble[data-role="assistant"]')).toContainText('模拟回答完成');
  await expect(element.locator('.tr-history__group-title')).toContainText('今天');
  await expect(page.getByTestId('history-service-status')).toHaveText('历史索引已同步');

  await page.getByRole('button', { name: '模拟历史失败' }).click();
  await expect(page.getByTestId('history-error')).toContainText('模拟历史服务暂时不可用');
  await page.getByRole('button', { name: '重试历史' }).click();
  await expect(page.getByTestId('history-service-status')).toHaveText('历史索引已同步');
  await expect(element.locator('.tr-history__item')).toContainText(
    'Repository grouped conversation',
  );
  expect(consoleErrors).toEqual([]);
});

test('forwards same-path requests for other origins instead of fabricating mock data', async ({
  page,
}) => {
  await page.route('https://example.invalid/mock-chat/chat/completions', async (route) => {
    await route.fulfill({ status: 200, contentType: 'text/plain', body: 'external-response' });
  });
  await openFreshApp(page);

  const response = await page.evaluate(async () => {
    const result = await fetch('https://example.invalid/mock-chat/chat/completions', {
      method: 'POST',
      body: '{}',
    });
    return { contentType: result.headers.get('content-type'), body: await result.text() };
  });

  expect(response).toEqual({ contentType: 'text/plain', body: 'external-response' });
});

test('selects current DeepSeek models and sends through the credential-free same-origin proxy', async ({
  page,
}) => {
  let requestBody: Record<string, unknown> | undefined;
  let browserAuthorization: string | undefined;
  await page.route('**/api/deepseek/chat/completions', async (route) => {
    requestBody = route.request().postDataJSON() as Record<string, unknown>;
    browserAuthorization = route.request().headers().authorization;
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: [
        'data: {"id":"deepseek-test","object":"chat.completion.chunk","created":1,"model":"deepseek-flash","choices":[{"index":0,"delta":{"role":"assistant","content":"DeepSeek proxy response"},"logprobs":null,"finish_reason":null}]}',
        '',
        'data: {"id":"deepseek-test","object":"chat.completion.chunk","created":1,"model":"deepseek-flash","choices":[{"index":0,"delta":{},"logprobs":null,"finish_reason":"stop"}]}',
        '',
        'data: [DONE]',
        '',
      ].join('\n'),
    });
  });
  await openFreshApp(page);

  const modelTrigger = chat(page).locator('.tr-chat-model-selector').getByRole('button');
  await modelTrigger.click();
  const listbox = page.getByRole('listbox');
  await expect(listbox.getByRole('option', { name: /DeepSeek V4.1 Flash/ })).toBeVisible();
  await expect(listbox.getByRole('option', { name: /DeepSeek V4 Pro/ })).toBeVisible();
  await listbox.getByRole('option', { name: /DeepSeek V4.1 Flash/ }).click();

  await sendFromComposer(page, '走本地安全代理');
  await expect(chat(page).locator('.tr-bubble[data-role="assistant"]')).toContainText(
    'DeepSeek proxy response',
  );
  expect(requestBody?.['model']).toBe('deepseek-flash');
  expect(browserAuthorization).toBeUndefined();
});

test('restores persisted conversations and provides a working settings shell', async ({ page }) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await sendFromComposer(page, 'Persist this conversation');
  await expect(element.locator('.tr-bubble[data-role="assistant"]')).toContainText('模拟回答完成');
  await page.reload();
  await expect(page.getByTestId('ready-state')).toContainText('ready');
  await expect(chat(page).locator('.tr-bubble[data-role="user"]')).toContainText(
    'Persist this conversation',
  );

  await page.getByRole('button', { name: '打开示例设置' }).click();
  const settings = page.getByRole('dialog', { name: '示例设置' });
  await expect(settings).toBeVisible();
  await settings.getByRole('button', { name: '夜间主题' }).click();
  await expect(page.locator('app-root')).toHaveAttribute('data-theme', 'night');
  await settings.getByLabel('界面语言').selectOption('en');
  await expect(page.getByTestId('settings-summary')).toContainText('English');
  await settings.getByLabel('朗读音色').selectOption('calm');
  await expect(page.getByTestId('settings-summary')).toContainText('沉稳');
  expect(consoleErrors).toEqual([]);
});

test('manages an MCP server and its tools through the Runtime-backed panel', async ({ page }) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await element.getByRole('button', { name: '扩展', exact: true }).click();
  await element.getByRole('tab', { name: 'MCP', exact: true }).click();
  const localServer = element.locator('.tr-extension-card').filter({ hasText: '本地项目工具' });
  await expect(localServer).toBeVisible();
  await localServer.getByRole('button', { name: '安装', exact: true }).click();
  await expect(localServer.getByRole('switch')).toBeChecked();

  await localServer.getByText('本地项目工具', { exact: true }).click();
  const searchTool = element.getByRole('switch', { name: '启用 search_project_code', exact: true });
  await expect(searchTool).toBeChecked();
  await searchTool.click();
  await expect(searchTool).not.toBeChecked();

  await element.getByRole('button', { name: '返回列表', exact: true }).click();
  await localServer.getByRole('button', { name: '更多操作', exact: true }).click();
  await page.getByRole('button', { name: '卸载', exact: true }).click();
  await expect(localServer.getByRole('button', { name: '安装', exact: true })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('executes a native MCP tools/call round and streams the final answer', async ({ page }) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await element.getByRole('button', { name: '扩展', exact: true }).click();
  await element.getByRole('tab', { name: 'MCP', exact: true }).click();
  const localServer = element.locator('.tr-extension-card').filter({ hasText: '本地项目工具' });
  await localServer.getByRole('button', { name: '安装', exact: true }).click();
  await expect(localServer.getByRole('switch')).toBeChecked();

  await sendFromComposer(page, '请使用 MCP 工具搜索项目 Runtime');
  await expect(page.getByTestId('mcp-call-record')).toContainText('search_project_code · success');
  await expect(page.getByTestId('mcp-call-record')).toContainText('找到与“Runtime”相关的 3 处代码');
  await expect(element.locator('.tr-bubble[data-role="assistant"]').last()).toContainText(
    'MCP 工具结果',
  );
  expect(consoleErrors).toEqual([]);
});

test('installs, selects, executes, inspects, and restores a native Skill plugin', async ({
  page,
}) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await element.getByRole('button', { name: '扩展', exact: true }).click();
  const skillCard = element.locator('.tr-extension-card').filter({ hasText: '项目摘要' });
  await expect(skillCard).toBeVisible();
  await skillCard.getByRole('button', { name: '安装', exact: true }).click();
  await expect(skillCard.getByRole('switch', { name: '启用', exact: true })).toBeChecked();
  await skillCard.getByRole('button', { name: '更多操作', exact: true }).click();
  await page.getByRole('button', { name: '本轮使用', exact: true }).click();

  await skillCard.getByText('项目摘要', { exact: true }).click();
  await expect(element.getByRole('heading', { name: '项目摘要' })).toBeVisible();
  await element.getByRole('button', { name: '返回扩展列表' }).click();

  await sendFromComposer(page, '总结当前 Angular 综合应用');
  await expect(page.getByTestId('resolved-skills')).toContainText('project-summary');
  await expect(element.locator('.tr-bubble[data-role="assistant"]').last()).toContainText(
    'Skill 已执行：project-summary',
  );

  await page.reload();
  await expect(page.getByTestId('ready-state')).toContainText('ready');
  await chat(page).getByRole('button', { name: '扩展', exact: true }).click();
  const restored = chat(page).locator('.tr-extension-card').filter({ hasText: '项目摘要' });
  await restored.getByRole('button', { name: '更多操作', exact: true }).click();
  await expect(page.getByRole('button', { name: '本轮使用', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(consoleErrors).toEqual([]);
});

test('copies, rates, and retries the matching assistant response', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await sendFromComposer(page, '需要消息操作');
  const assistant = element.locator('.tr-bubble[data-role="assistant"]').last();
  await expect(assistant).toContainText('已收到：需要消息操作');

  await assistant.getByRole('button', { name: '复制回答', exact: true }).click();
  await expect(assistant.getByRole('button', { name: '已复制', exact: true })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('已收到：需要消息操作');

  await assistant.getByRole('button', { name: '有帮助', exact: true }).click();
  await expect(assistant.getByRole('button', { name: '已评价', exact: true })).toBeDisabled();

  await assistant.getByRole('button', { name: '重新生成', exact: true }).click();
  await expect(element.locator('.tr-bubble[data-role="user"]')).toHaveCount(2);
  await expect(element.locator('.tr-bubble[data-role="user"]').last()).toContainText(
    '需要消息操作',
  );
  await expect(element.locator('.tr-bubble[data-role="assistant"]')).toHaveCount(2);
  await expect(element.locator('.tr-bubble[data-role="assistant"]').last()).toContainText(
    '已收到：需要消息操作',
  );
  expect(consoleErrors).toEqual([]);
});

test('records a negative feedback reason and prevents conflicting positive feedback', async ({
  page,
}) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await sendFromComposer(page, '需要负向反馈');
  const assistant = element.locator('.tr-bubble[data-role="assistant"]').last();
  await expect(assistant).toContainText('已收到：需要负向反馈');

  await assistant.getByRole('button', { name: '不满意', exact: true }).click();
  const reasonPanel = assistant.getByRole('dialog', { name: '选择不满意原因' });
  await expect(reasonPanel).toBeVisible();
  await reasonPanel.getByRole('button', { name: '内容不准确', exact: true }).click();

  await expect(
    assistant.getByRole('button', { name: '已反馈：内容不准确', exact: true }),
  ).toBeDisabled();
  await expect(assistant.getByRole('button', { name: '有帮助', exact: true })).toBeDisabled();
  await expect(reasonPanel).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
});

test('enables message actions only after the streamed answer completes', async ({ page }) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await sendFromComposer(page, '等待完整回答');
  await expect
    .poll(() =>
      element.evaluate(
        (host: RuntimeStateHost) => host.getRuntime()?.activeConversation.value?.requestState,
      ),
    )
    .toBe('processing');

  const assistant = element.locator('.tr-bubble[data-role="assistant"]').last();
  await expect(assistant.getByRole('button', { name: '不满意', exact: true })).toBeDisabled();
  await expect(assistant).toContainText('已收到：等待完整回答');
  await expect(assistant.getByRole('button', { name: '不满意', exact: true })).toBeEnabled();
  expect(consoleErrors).toEqual([]);
});

test('reads an assistant response aloud and stops the active playback', async ({ page }) => {
  await page.addInitScript(() => {
    class TestUtterance extends EventTarget {
      constructor(readonly text: string) {
        super();
      }
    }

    let active: TestUtterance | undefined;
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: TestUtterance,
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak(utterance: TestUtterance) {
          active = utterance;
          queueMicrotask(() => utterance.dispatchEvent(new Event('start')));
        },
        cancel() {
          active?.dispatchEvent(new Event('end'));
          active = undefined;
        },
        getVoices: () => [],
      },
    });
  });
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await sendFromComposer(page, '需要朗读');
  const assistant = element.locator('.tr-bubble[data-role="assistant"]').last();
  const readButton = assistant.getByRole('button', { name: '朗读', exact: true });
  await readButton.click();
  await expect(assistant.getByRole('button', { name: '停止朗读', exact: true })).toBeVisible();
  await assistant.getByRole('button', { name: '停止朗读', exact: true }).click();
  await expect(assistant.getByRole('button', { name: '朗读', exact: true })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('shows a recoverable state when browser speech APIs are unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: undefined,
    });
  });
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await sendFromComposer(page, '缺少朗读能力');
  const assistant = element.locator('.tr-bubble[data-role="assistant"]').last();
  await expect(assistant).toContainText('已收到：缺少朗读能力');
  await assistant.getByRole('button', { name: '朗读', exact: true }).click();
  await expect(assistant.getByRole('button', { name: '朗读不可用', exact: true })).toBeDisabled();
  expect(consoleErrors).toEqual([]);
});

test('shares only the selected assistant response through the Web Share boundary', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        document.documentElement.dataset['sharedText'] = data.text ?? '';
      },
    });
  });
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await sendFromComposer(page, '需要分享');
  const assistant = element.locator('.tr-bubble[data-role="assistant"]').last();
  const expectedAnswer = '确定性模拟回答完成。深度思考：关闭。智能搜索：关闭。已收到：需要分享';
  await expect(assistant).toContainText(expectedAnswer);
  await assistant.getByRole('button', { name: '分享', exact: true }).click();
  await expect(assistant.getByRole('button', { name: '已分享', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-shared-text', expectedAnswer);
  expect(consoleErrors).toEqual([]);
});

test('copies the selected assistant response when Web Share is unavailable', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  });
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await sendFromComposer(page, '需要分享回退');
  const assistant = element
    .locator('.tr-bubble[data-role="assistant"]')
    .filter({ hasText: '已收到：需要分享回退' });
  const expectedAnswer = '确定性模拟回答完成。深度思考：关闭。智能搜索：关闭。已收到：需要分享回退';
  await expect(assistant).toContainText(expectedAnswer);
  await assistant.getByRole('button', { name: '分享', exact: true }).click();
  await expect(
    assistant.getByRole('button', { name: '已复制分享内容', exact: true }),
  ).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(expectedAnswer);
  await sendFromComposer(page, '触发消息重渲染');
  await expect(element.locator('.tr-bubble[data-role="assistant"]').last()).toContainText(
    '已收到：触发消息重渲染',
  );
  await expect(
    assistant.getByRole('button', { name: '已复制分享内容', exact: true }),
  ).toBeDisabled();
  expect(consoleErrors).toEqual([]);
});

test('falls back to copying when Web Share rejects the request', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => {
        throw new DOMException('Permission denied', 'NotAllowedError');
      },
    });
  });
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await sendFromComposer(page, '需要分享拒绝回退');
  const assistant = element.locator('.tr-bubble[data-role="assistant"]').last();
  const expectedAnswer =
    '确定性模拟回答完成。深度思考：关闭。智能搜索：关闭。已收到：需要分享拒绝回退';
  await expect(assistant).toContainText(expectedAnswer);
  await assistant.getByRole('button', { name: '分享', exact: true }).click();
  await expect(
    assistant.getByRole('button', { name: '已复制分享内容', exact: true }),
  ).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(expectedAnswer);
  expect(consoleErrors).toEqual([]);
});

test('restores the share action when the native share sheet is cancelled', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => {
        throw new DOMException('Share cancelled', 'AbortError');
      },
    });
  });
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await sendFromComposer(page, '取消分享');
  const assistant = element.locator('.tr-bubble[data-role="assistant"]').last();
  await expect(assistant).toContainText('已收到：取消分享');
  await assistant.getByRole('button', { name: '分享', exact: true }).click();
  await expect(assistant.getByRole('button', { name: '分享', exact: true })).toBeEnabled();
  expect(consoleErrors).toEqual([]);
});

test('selects, removes, submits, and clears Sender attachments', async ({ page }) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  const chooserPromise = page.waitForEvent('filechooser');
  await element.getByRole('button', { name: '添加附件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles([
    { name: 'architecture.txt', mimeType: 'text/plain', buffer: Buffer.from('architecture') },
    { name: 'release-notes.md', mimeType: 'text/markdown', buffer: Buffer.from('release') },
    { name: 'screen.png', mimeType: 'image/png', buffer: Buffer.from([137, 80, 78, 71]) },
  ]);

  const attachments = element.locator('.tr-attachments');
  await expect(attachments).toContainText('architecture.txt');
  await expect(attachments).toContainText('release-notes.md');
  await expect(attachments).toContainText('screen.png');
  await expect(page.getByRole('img', { name: 'screen.png 预览' })).toBeVisible();
  await expect(page.getByTestId('processed-attachment')).toHaveCount(3);
  await attachments
    .locator('.tr-file-card')
    .filter({ hasText: 'architecture.txt' })
    .getByRole('button', { name: '移除文件', exact: true })
    .click();
  await expect(attachments).not.toContainText('architecture.txt');

  await sendFromComposer(page, '请阅读附件');
  await expect(page.getByTestId('attachment-submit-status')).toHaveText(
    '已随消息提交附件：release-notes.md、screen.png',
  );
  await expect(element.locator('.tr-attachments')).toHaveCount(0);
  await expect(element.locator('.tr-bubble[data-role="assistant"]').last()).toContainText(
    '已收到：请阅读附件',
  );
  await expect(element.locator('.tr-bubble[data-role="assistant"]').last()).toContainText(
    '[图片 1]',
  );
  expect(consoleErrors).toEqual([]);
});

test('completes the integrated Angular history Skill image and MCP business flow', async ({
  page,
}) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);

  await element.getByRole('button', { name: '扩展', exact: true }).click();
  await element.getByRole('tab', { name: 'MCP', exact: true }).click();
  const server = element.locator('.tr-extension-card').filter({ hasText: '本地项目工具' });
  await server.getByRole('button', { name: '安装', exact: true }).click();
  await element.getByRole('tab', { name: 'Skills', exact: true }).click();
  const skill = element.locator('.tr-extension-card').filter({ hasText: '项目摘要' });
  await skill.getByRole('button', { name: '安装', exact: true }).click();
  await skill.getByRole('button', { name: '更多操作', exact: true }).click();
  await page.getByRole('button', { name: '本轮使用', exact: true }).click();

  const chooserPromise = page.waitForEvent('filechooser');
  await element.getByRole('button', { name: '添加附件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'integrated-screen.png',
    mimeType: 'image/png',
    buffer: Buffer.from([137, 80, 78, 71]),
  });
  await expect(page.getByRole('img', { name: 'integrated-screen.png 预览' })).toBeVisible();

  await sendFromComposer(page, '请使用 MCP 工具搜索项目 Runtime，并总结当前应用');
  await expect(page.getByTestId('mcp-call-record')).toContainText('search_project_code · success');
  await expect(page.getByTestId('resolved-skills')).toContainText('project-summary');
  await expect(element.locator('.tr-bubble[data-role="assistant"]').last()).toContainText(
    'MCP 工具结果',
  );
  await expect(element.locator('.tr-attachments')).toHaveCount(0);
  await expect(page.getByTestId('scenario-overall')).toHaveText('总体：ready');
  expect(consoleErrors).toEqual([]);
});

test('keeps the controlled right-aside open state synchronized in both directions', async ({
  page,
}) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);
  const status = page.getByTestId('aside-binding-status');

  await expect(status).toHaveText('右侧面板：关闭 · 当前面板：发布预览');
  await page.getByRole('button', { name: '打开发布预览', exact: true }).click();
  await expect(status).toHaveText('右侧面板：打开 · 当前面板：发布预览');
  await expect(element.getByText('Angular 发布方案', { exact: true })).toBeVisible();
  await expect
    .poll(() => element.evaluate((host: TrChatHTMLElement) => host.rightAsideOpen))
    .toBe(true);

  await element.getByRole('button', { name: '关闭详情', exact: true }).click();
  await expect(status).toHaveText('右侧面板：关闭 · 当前面板：发布预览');
  await expect
    .poll(() => element.evaluate((host: TrChatHTMLElement) => host.rightAsideOpen))
    .toBe(false);
  expect(consoleErrors).toEqual([]);
});

test('writes active right-aside panel updates back into the Angular signal', async ({ page }) => {
  const consoleErrors = await openFreshApp(page);
  const element = chat(page);
  const status = page.getByTestId('aside-binding-status');

  await page.getByRole('button', { name: '打开参考资料', exact: true }).click();
  await expect(status).toHaveText('右侧面板：打开 · 当前面板：参考资料');
  await expect(element.getByText('Angular 参考资料', { exact: true })).toBeVisible();
  await expect
    .poll(() => element.evaluate((host: TrChatHTMLElement) => host.activeRightAsidePanelId))
    .toBe('sources');

  await element.getByRole('button', { name: '切换到发布预览', exact: true }).click();
  await expect(status).toHaveText('右侧面板：打开 · 当前面板：发布预览');
  await expect(element.getByText('Angular 发布方案', { exact: true })).toBeVisible();
  await expect
    .poll(() => element.evaluate((host: TrChatHTMLElement) => host.activeRightAsidePanelId))
    .toBe('preview');
  expect(consoleErrors).toEqual([]);
});

test('writes floating drag and resize updates back into an Angular-owned state object', async ({
  page,
}) => {
  const consoleErrors = await openFreshApp(page);
  const status = page.getByTestId('floating-binding-status');
  await expect(status).toHaveText('浮动窗口：关闭 · x 24px · y 72px · 520 × 520px');

  await page.getByRole('button', { name: '打开浮动验收', exact: true }).click();
  const floating = page.locator('.tr-layout--floating');
  await expect(floating).toBeVisible();
  await expect(status).toHaveText('浮动窗口：打开 · x 24px · y 72px · 520 × 520px');

  const dragBox = await floating.locator('.tr-layout__drag-bar').boundingBox();
  expect(dragBox).not.toBeNull();
  await page.mouse.move(dragBox!.x + dragBox!.width / 2, dragBox!.y + dragBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    dragBox!.x + dragBox!.width / 2 - 40,
    dragBox!.y + dragBox!.height / 2 + 30,
  );
  await page.mouse.up();
  await expect(status).not.toHaveText('浮动窗口：打开 · x 24px · y 72px · 520 × 520px');

  const stateAfterDrag = await page.getByTestId('floating-chat').evaluate(
    (
      host: HTMLElement & {
        floatingState?: { offsetX: number; offsetY: number; width: number; height: number };
      },
    ) => host.floatingState,
  );

  const resizeBox = await floating.locator('.tr-layout__floating-resize-trigger--se').boundingBox();
  expect(resizeBox).not.toBeNull();
  await page.mouse.move(resizeBox!.x + resizeBox!.width / 2, resizeBox!.y + resizeBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    resizeBox!.x + resizeBox!.width / 2 + 40,
    resizeBox!.y + resizeBox!.height / 2 + 30,
  );
  await page.mouse.up();

  const stateAfterResize = await page.getByTestId('floating-chat').evaluate(
    (
      host: HTMLElement & {
        floatingState?: { offsetX: number; offsetY: number; width: number; height: number };
      },
    ) => host.floatingState,
  );
  expect(stateAfterResize?.width).toBeGreaterThan(stateAfterDrag?.width ?? 0);
  expect(stateAfterResize?.height).toBeGreaterThan(stateAfterDrag?.height ?? 0);
  await expect(status).toHaveText(
    `浮动窗口：打开 · x ${stateAfterResize?.offsetX}px · y ${stateAfterResize?.offsetY}px · ${stateAfterResize?.width} × ${stateAfterResize?.height}px`,
  );
  expect(consoleErrors).toEqual([]);
});
