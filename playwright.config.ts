import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  reporter: 'list',
  use: {
    headless: true,
    baseURL: process.env.E2E_BASE_URL || 'https://cwaassesment.vercel.app',
  },
});
