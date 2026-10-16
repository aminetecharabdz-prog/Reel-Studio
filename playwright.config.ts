import { defineConfig, devices } from '@playwright/test';

const mobile = { ...devices['Pixel 7'], viewport: { width: 412, height: 915 } };
const desktop = { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } };
const executablePath = process.env.PW_CHROMIUM ?? undefined;
const live = process.env.LIVE_URL;

export default defineConfig({
  testDir: 'tests',
  timeout: 240_000,
  expect: { timeout: 20_000 },
  retries: 0,
  reporter: [['list']],
  use: { trace: 'off', screenshot: 'on', launchOptions: executablePath ? { executablePath } : {} },
  projects: [
    { name: 'local-mobile', use: { ...mobile, baseURL: 'http://localhost:4173/' } },
    { name: 'local-desktop', use: { ...desktop, baseURL: 'http://localhost:4173/' } },
    { name: 'live-mobile', use: { ...mobile, baseURL: live } },
    { name: 'live-desktop', use: { ...desktop, baseURL: live } },
  ],
  webServer: live ? undefined : { command: 'npm run preview', url: 'http://localhost:4173/', reuseExistingServer: true, timeout: 60_000 },
});
