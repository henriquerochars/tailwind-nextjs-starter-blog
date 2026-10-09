import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/blog',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 30000,
  reporter: [['list']],
  use: {
    baseURL: process.env.BLOG_TEST_URL,
    colorScheme: 'light',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 1000 },
        timezoneId: 'Pacific/Honolulu',
      },
    },
    {
      name: 'mobile',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        timezoneId: 'Pacific/Kiritimati',
      },
    },
  ],
})
