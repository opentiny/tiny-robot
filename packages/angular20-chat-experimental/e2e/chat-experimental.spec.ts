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

  await page.getByTestId('send').click();

  await expect(page.getByTestId('send-state')).toContainText('complete');
  await expect(chat).toContainText('Angular 20 response complete');
  await expect(page.locator('app-root')).toHaveAttribute('data-integration-status', 'complete');
  expect(consoleErrors).toEqual([]);
});
