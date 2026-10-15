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
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  expect(narrowGeometry.layoutLeft).toBeGreaterThanOrEqual(narrowGeometry.hostLeft);
  expect(narrowGeometry.layoutRight).toBeLessThanOrEqual(narrowGeometry.hostRight);
  expect(narrowGeometry.mainLeft).toBeGreaterThanOrEqual(narrowGeometry.hostLeft);
  expect(narrowGeometry.mainRight).toBeLessThanOrEqual(narrowGeometry.hostRight);
  expect(narrowGeometry.documentWidth).toBeLessThanOrEqual(narrowGeometry.viewportWidth);
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
  await expect(thinking).toHaveClass(/tr-chat-model-features__button--active/);
  await expect(search).toHaveClass(/tr-chat-model-features__button--active/);

  await sendFromComposer(page, '验证 Angular 应用发送');
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
  await expect(element.locator('.tr-history__item')).toHaveCount(1);
  await expect(element.locator('.tr-history__item')).toContainText('Beta release notes');

  const currentBetaItem = element
    .locator('.tr-history__item')
    .filter({ hasText: 'Beta release notes' });
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
