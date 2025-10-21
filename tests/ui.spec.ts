import { test, expect } from '@playwright/test';

test('Escape Room UI loads with timer', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/escape-room`);
  await expect(page.getByText('Escape Room')).toBeVisible();
  await expect(page.getByText('⏳')).toBeVisible(); // timer indicator
});
