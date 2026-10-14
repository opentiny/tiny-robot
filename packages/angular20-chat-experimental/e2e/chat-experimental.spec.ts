import { expect, test } from '@playwright/test';

test('runs the workspace TrChat experimental element end to end in Angular 20', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');

  const chat = page.getByTestId('tr-chat');
  await expect(page.getByTestId('ready-state')).toContainText('ready');
  await expect(chat.locator('.tr-chat-ui')).toBeVisible();
  await expect(chat.locator('.tr-layout__body')).toHaveCSS('display', 'grid');
  await expect(chat.locator('.tr-layout__aside--left')).toHaveCSS('grid-area', 'left');
  await expect(chat.locator('.tr-sender')).toHaveCSS('display', 'flex');
  const geometry = await chat.evaluate((host) => {
    const layout = host.querySelector<HTMLElement>('.tr-layout');
    const sender = host.querySelector<HTMLElement>('.tr-sender');
    if (!layout || !sender) throw new Error('Expected TrChat layout and sender');

    const hostRect = host.getBoundingClientRect();
    const layoutRect = layout.getBoundingClientRect();
    const senderRect = sender.getBoundingClientRect();
    return {
      hostHeight: hostRect.height,
      layoutHeight: layoutRect.height,
      senderBottom: senderRect.bottom,
      hostBottom: hostRect.bottom,
    };
  });
  expect(Math.abs(geometry.hostHeight - geometry.layoutHeight)).toBeLessThan(1);
  expect(geometry.senderBottom).toBeLessThanOrEqual(geometry.hostBottom);

  await page.setViewportSize({ width: 320, height: 900 });
  const narrowGeometry = await chat.evaluate((host) => {
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

  await page.getByTestId('send').click();

  await expect(page.getByTestId('send-state')).toContainText('complete');
  await expect(chat).toContainText('Angular 20 response complete');
  await expect(page.locator('app-root')).toHaveAttribute('data-integration-status', 'complete');
  expect(consoleErrors).toEqual([]);
});
