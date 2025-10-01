import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config();

/**
 * Environment variable configuration
 */
const HEADLESS = false; // Force visible browser for demo
const MOCK_APP = process.env.MOCK_APP === 'true'; // Default to false, unless explicitly true
const TEST_ENV = process.env.TEST_ENV || 't1';

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

    /* Force visible browser */
    headless: false,

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
        // Force visible browser with explicit settings
        headless: false,
        launchOptions: {
          headless: false,
          slowMo: 1000,
          devtools: false,
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--start-maximized'
          ]
        }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
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
      use: { ...devices['Desktop Safari'] },
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
  // webServer: {
  //   command: 'node scripts/serve-mock.mjs',
  //   url: 'http://127.0.0.1:5173',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },

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