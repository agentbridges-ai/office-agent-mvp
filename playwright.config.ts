import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  retries: 1,
  use: {
    baseURL: process.env.APP_URL || 'http://127.0.0.1:5173',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    actionTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
      },
    },
  ],
  // Require: npx playwright install chromium (network needed for first run)
  // If headless shell not available, use: npx vite + bin/smoke_onlyoffice_9_3_browser.mjs
});
