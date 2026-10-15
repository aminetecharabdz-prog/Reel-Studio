import { defineConfig, devices } from '@playwright/test';

const mobile = { ...devices['Pixel 7'], viewport: { width: 412, height: 915 } };
const executablePath = process.env.PW_CHROMIUM ?? undefined;

export default defineConfig({
  testDir: 'tests',
  timeout: 240_000,
  expect: { timeout: 20_000 },
  retries: 0,
  reporter: [['list']],
  use: { trace: 'off', screenshot: 'only-on-failure', launchOptions: executablePath ? { executablePath } : {} },
  projects: [
    { name: 'local', use: { ...mobile, baseURL: 'http://localhost:4173/' } },
    { name: 'live', use: { ...mobile, baseURL: process.env.LIVE_URL }, grep: /@live/ },
  ],
  webServer: process.env.LIVE_URL
    ? undefined
    : { command: 'npm run preview', url: 'http://localhost:4173/', reuseExistingServer: true, timeout: 60_000 },
});
