import {defineConfig} from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.APP_URL || 'http://127.0.0.1:5173',
    viewport: {width: 1440, height: 1000},
    launchOptions: process.env.CHROME_PATH
      ? {executablePath: process.env.CHROME_PATH}
      : {},
    channel: process.env.CHROME_PATH ? undefined : 'chrome',
  },
  webServer: process.env.APP_URL ? undefined : {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
  },
})
