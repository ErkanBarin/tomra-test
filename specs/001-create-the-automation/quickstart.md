# Quickstart Guide: Tomra MLOPS Test Automation

## Overview
This guide helps you quickly set up and run the Tomra Food MLOPS Platform test automation suite. The suite validates complete user workflows with truth pairing - verifying both UI actions and underlying Azure infrastructure state.

## Prerequisites
- Node.js 20.x or later
- pnpm package manager
- Git
- Access to Azure test environment (optional for local mock testing)

## Quick Setup

### 1. Clone and Install
```bash
# Clone repository
git clone <repository-url>
cd tomra-mlops-automation

# Install dependencies
pnpm install

# Install Playwright browsers
pnpm dlx playwright install chromium firefox
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit configuration for your environment
# For local development with mocks:
cat > .env.local << EOF
TEST_ENV=local
BASE_URL=http://localhost:3000
AZURE_STORAGE_ACCOUNT=mock
AZURE_ML_WORKSPACE=mock
USE_MOCKS=true
EOF
```

### 3. Run Smoke Tests
```bash
# Run all smoke tests with mocks (fastest)
TEST_ENV=local pnpm exec playwright test -g @smoke --project=chromium

# Run tests against staging environment
TEST_ENV=t1 pnpm exec playwright test -g @smoke --project=chromium

# Run full suite on multiple browsers
TEST_ENV=t1 pnpm exec playwright test -g @smoke --project=chromium --project=firefox
```

## Test Scenarios

### Upload Workflow Test
**What it tests**: Complete image upload with Azure Blob verification
```bash
# Run just upload tests
pnpm exec playwright test upload.smoke.spec.mjs --project=chromium

# Expected behavior:
# 1. Navigate to upload page
# 2. Select test image file
# 3. Click upload button
# 4. Verify UI success message
# 5. Truth pairing: HEAD request to Azure Blob Storage
# 6. Confirm blob exists and has correct metadata
```

### Training Workflow Test
**What it tests**: Model training with mocked Azure ML metrics validation
```bash
# Run training tests
pnpm exec playwright test training.mock.smoke.spec.mjs --project=chromium

# Expected behavior:
# 1. Navigate to training page
# 2. Configure training job
# 3. Submit training job
# 4. Poll job status (queued → running → completed)
# 5. Truth pairing: Check Azure ML job status API
# 6. Validate mock metrics (F1 score ≥ 0.92)
```

### Registry & Deployment Test
**What it tests**: Model registration and deployment validation
```bash
# Run registry tests
pnpm exec playwright test registry.smoke.spec.mjs --project=chromium

# Expected behavior:
# 1. Navigate to model registry
# 2. Deploy trained model
# 3. Verify deployment UI status
# 4. Truth pairing: GET Model Registry API
# 5. Confirm model is registered and deployable
```

## Understanding Test Output

### Successful Run
```bash
Running 3 tests using 1 worker

✓ tests/smoke/upload.smoke.spec.mjs:7:3 › should upload image and verify blob storage (2.1s)
✓ tests/smoke/training.mock.smoke.spec.mjs:12:3 › should complete training with F1 ≥ 0.92 (3.4s)
✓ tests/smoke/registry.smoke.spec.mjs:8:3 › should register and deploy model (1.8s)

3 passed (8.2s)
```

### Failed Run with Debugging
```bash
# Tests fail with detailed traces
✗ tests/smoke/upload.smoke.spec.mjs:7:3 › should upload image and verify blob storage (5.0s)

Error: Blob verification failed - HEAD request returned 404
   at BlobVerification.verifyExists (utils/azure.mjs:45:11)

# View HTML report with screenshots and traces
pnpm exec playwright show-report

# Or check specific trace file
pnpm exec playwright show-trace test-results/upload-smoke-chromium/trace.zip
```

## Configuration Options

### Environment Variables
```bash
# Core settings
TEST_ENV=local|t1|staging|prod    # Environment to test against
BASE_URL=http://localhost:3000    # Application base URL
USE_MOCKS=true|false             # Enable/disable Azure mocking

# Azure settings (when USE_MOCKS=false)
AZURE_STORAGE_ACCOUNT=tomratest   # Storage account name
AZURE_STORAGE_CONTAINER=uploads   # Blob container name
AZURE_ML_WORKSPACE=tomra-mlops    # ML workspace name
AZURE_SUBSCRIPTION_ID=<uuid>      # Azure subscription
AZURE_RESOURCE_GROUP=tomra-rg     # Resource group

# Test behavior
HEADLESS=true|false              # Browser visibility
TIMEOUT=30000                    # Test timeout in ms
PARALLEL_WORKERS=1               # Concurrent test execution
```

### Browser Configuration
```javascript
// playwright.config.mjs excerpt
export default {
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ],
  use: {
    headless: process.env.HEADLESS !== 'false',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  }
};
```

## Troubleshooting

### Common Issues

#### 1. "Browser not found" Error
```bash
# Solution: Install Playwright browsers
pnpm dlx playwright install
```

#### 2. "Azure authentication failed"
```bash
# Solution: Check environment variables
echo $AZURE_STORAGE_ACCOUNT
echo $AZURE_ML_WORKSPACE

# Or use mocks for local development
export USE_MOCKS=true
```

#### 3. "Test timeout" Error
```bash
# Solution: Increase timeout or check network
export TIMEOUT=60000

# Or run with UI to see what's happening
export HEADLESS=false
```

#### 4. "Blob verification failed"
```bash
# Check if using correct environment
echo $TEST_ENV

# Verify Azure permissions
az storage account show --name $AZURE_STORAGE_ACCOUNT

# Or switch to mock mode
export USE_MOCKS=true
```

### Debug Mode
```bash
# Run single test with full debugging
DEBUG=pw:api TEST_ENV=local pnpm exec playwright test upload.smoke.spec.mjs --headed

# Generate trace for failed test
pnpm exec playwright test --trace=on

# Record test execution
pnpm exec playwright codegen http://localhost:3000
```

## CI/CD Integration

### GitHub Actions Usage
```yaml
# .github/workflows/pr-validation.yml
name: PR Smoke Tests
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm dlx playwright install --with-deps chromium firefox
      
      - name: Run smoke tests
        run: TEST_ENV=t1 pnpm exec playwright test -g @smoke --project=chromium --project=firefox
        env:
          AZURE_STORAGE_ACCOUNT: ${{ secrets.AZURE_STORAGE_ACCOUNT }}
          AZURE_ML_WORKSPACE: ${{ secrets.AZURE_ML_WORKSPACE }}
      
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Local CI Simulation
```bash
# Simulate CI environment locally
export CI=true
export TEST_ENV=t1
export HEADLESS=true

# Run with time limit (CI budget: 10 minutes)
timeout 600 pnpm exec playwright test -g @smoke --project=chromium --project=firefox
```

## Performance Targets

### Time Budget (CI Compliance)
- **Setup & Dependencies**: ≤ 2 minutes
- **Browser Installation**: ≤ 3 minutes  
- **Test Execution**: ≤ 4 minutes
- **Artifact Collection**: ≤ 1 minute
- **Total**: ≤ 10 minutes

### Individual Test Performance
- **Upload Test**: ≤ 30 seconds
- **Training Test**: ≤ 60 seconds (with mocking)
- **Registry Test**: ≤ 20 seconds
- **Per-test Overhead**: ≤ 10 seconds

### Monitoring Commands
```bash
# Time test execution
time pnpm exec playwright test -g @smoke

# Monitor resource usage
htop  # CPU/memory during test run

# Check test timing breakdown
pnpm exec playwright test --reporter=line
```

## Data Management

### Test Images
```bash
# Location: tests/data/sample-images/
# Requirements:
# - Size: < 1MB each
# - Formats: JPEG, PNG
# - Content: Food images (tomato, apple, mixed-salad)

# Verify test data
ls -la tests/data/sample-images/
# tomato.jpg    (~800KB)
# apple.jpg     (~650KB)  
# mixed-salad.jpg (~900KB)
```

### Cleanup
```bash
# Clean test artifacts
rm -rf test-results/
rm -rf playwright-report/

# Clean Azure test data (if using real Azure)
# This should be automated in tests, but manual cleanup:
az storage blob delete-batch --account-name $AZURE_STORAGE_ACCOUNT --source uploads --pattern "test-*"
```

## Next Steps

### After Successful Quickstart
1. **Explore Reports**: Check `playwright-report/index.html` for detailed test results
2. **Customize Tests**: Add your own test scenarios to existing specs
3. **Configure CI**: Set up automated testing in your CI/CD pipeline
4. **Monitor Performance**: Track test execution times and Azure costs

### Advanced Usage
- **Custom Page Objects**: Add new pages to `pages/` directory
- **Extended Azure Integration**: Configure real Azure resources for staging tests
- **Performance Testing**: Add load testing scenarios for key workflows
- **Accessibility Testing**: Include a11y validation in your test suite

## Support & Documentation

### Key Files
- `playwright.config.mjs`: Test runner configuration
- `tests/fixtures/test-fixtures.mjs`: Shared test utilities
- `utils/azure.mjs`: Azure integration helpers
- `pages/*.page.mjs`: Page object models

### Resources
- [Playwright Documentation](https://playwright.dev/)
- [Azure ML REST API](https://docs.microsoft.com/en-us/rest/api/azureml/)
- [Project README](README.md): Comprehensive project documentation

---
*Quickstart Version: 1.0 | Generated: October 1, 2025*