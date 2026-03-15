import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  outputDir: './test/e2e/artifacts',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1600, height: 1200 }
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }]
  ],
  webServer: {
    command: 'npm run test:e2e:serve',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
