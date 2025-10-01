import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 * 
 * Environment Variables:
 * - HEADLESS: Set to 'true' or '1' to run in headless mode (default: false)
 * - PLAYWRIGHT_DEBUG: Set to 'true' to enable debug mode with slowMo and maximized window (default: false)
 * - MOCK_APP: Set to 'true' to use mock application instead of real services (default: false)
 */
// import dotenv from 'dotenv';
// dotenv.config();

/**
 * Environment variable configuration
 */
const isCI = !!process.env.CI;
const HEADLESS = process.env.HEADLESS !== undefined 
  ? (process.env.HEADLESS === 'true' || process.env.HEADLESS === '1')
  : isCI; // Default to true on CI, false locally
const PLAYWRIGHT_DEBUG = process.env.PLAYWRIGHT_DEBUG === 'true'; // Debug/demo mode
const MOCK_APP = process.env.MOCK_APP === 'true'; // Default to false, unless explicitly true

/**
 * Determine baseURL based on MOCK_APP setting
 */
function getBaseURL() {
  if (MOCK_APP) {
    // Use file:// URLs for mock app
    return null; // Page objects will handle file:// navigation
  }
  
  // Try to load environment config
  try {
    // For now, fallback to local mock server
    // TODO: Implement proper env config loading when needed
    return 'http://127.0.0.1:5173';
  } catch {
    // Fallback to local mock server if no env config
    return 'http://127.0.0.1:5173';
  }
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'html' : 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: getBaseURL(),

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video always to prove browser opened */
    video: 'on',
    
    /* Global timeout for all tests */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: HEADLESS,
        launchOptions: {
          slowMo: PLAYWRIGHT_DEBUG ? 500 : 0, // Reduced slowMo for debug, 0 for CI
          devtools: PLAYWRIGHT_DEBUG,
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            // Security note: --disable-web-security removed for security.
            // If specific tests require it, add conditionally with documentation.
            ...(PLAYWRIGHT_DEBUG ? ['--start-maximized'] : [])
          ]
        }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        headless: HEADLESS,
        // Firefox-specific settings for file uploads
        launchOptions: {
          firefoxUserPrefs: {
            'dom.file.createInChild': true
          }
        }
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: HEADLESS,
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: MOCK_APP ? {
    command: 'node scripts/serve-mock.mjs',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  } : undefined,

  /* Global timeout for entire test suite */
  globalTimeout: process.env.CI ? 10 * 60 * 1000 : undefined, // 10 minutes on CI

  /* Timeout for individual tests */
  timeout: 60 * 1000, // 60 seconds

  /* Expect timeout for assertions */
  expect: {
    /* Timeout for expect() calls */
    timeout: 10000,
  },

  /* Output directories */
  outputDir: 'test-results/',
  
  /* Test patterns */
  testMatch: ['**/*.spec.mjs', '**/*.test.mjs'],
  
  /* Global setup and teardown */
  // globalSetup: require.resolve('./tests/global-setup'),
  // globalTeardown: require.resolve('./tests/global-teardown'),
});