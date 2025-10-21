import { test, expect } from '@playwright/test';

test('Escape Room UI loads with timer', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/escape-room`);
  await expect(page.getByText('Escape Room')).toBeVisible();
  const countdown = page.locator('text=/\\d{1,2}:\\d{2}/'); // matches 03:00
  await expect(countdown.first()).toBeVisible();
  
});
