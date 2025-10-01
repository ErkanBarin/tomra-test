# TOMRA MLOps Demo

What this repo is: a self-contained demo of core MLOps interactions for a food-classification pipeline. It shows how image uploads, model evaluation and a simple model registry can be tested end-to-end using Playwright and small mock pages.

What it does (short):
- Uploads sample images via a mock upload UI
- Validates uploads and simulates blob verification
- Lists models in a mock Model Registry and checks simple quality metrics
- Runs end-to-end demo flows showing upload → training → registry

How it works (high level):
- Playwright tests drive the browser against either local mock HTML apps (fast demo) or real pages
- Mock apps live in `tests/fixtures/mock-app/` and emulate server behavior
- Utilities in `utils/` provide small helpers (timing, azure stubs)

Tools used:
- Node.js (>=20) and Playwright for browser automation
- Lightweight mock HTML pages instead of a backend server for deterministic demos

How to run (dev/demo):
1. Install dependencies

```bash
npm install
```

2. Serve mocks (optional, demo mode):

```bash
npm run serve:mock
# open http://127.0.0.1:5173/upload.html manually if you want
```

3. Run the sequential E2E demo (visible browser):

```bash
npm run test:demo:show
```

Quick commands:

```bash
npm test                 # run all tests (headless)
npm run test:demo        # run demo-tagged tests (headless)
npm run test:demo:headed # run demo-tagged tests (visible, parallel)
```

What is intentionally missing (this is a demo):
- No real backend or persistent storage (mocked blob verification)
- No CI secrets for Azure — CI should use secure credentials and real Azure integration when needed
- Limited dataset and metrics (intended to demonstrate flows, not production quality)

If you want this to be production-ready, you'd add:
- Real backend endpoints and authentication
- Secure storage of credentials and pipelines for model training
- Expanded datasets, monitoring, and model promotion workflows

Project layout (short):

```
pages/               # Page objects
tests/               # smoke, integration, e2e, fixtures
utils/               # helpers (azure stubs, wait helpers)
data/samples/images/ # optional test images
scripts/             # serve-mock, demo runners
```

License and authorship: internal TOMRA demo project.
```

### ML Job Monitoring

```javascript
import { AzureMLUtils } from './utils/azure.mjs';

const mlUtils = new AzureMLUtils();
const jobStatus = await mlUtils.getJobStatus(jobId);
```

## 🧪 Testing Guidelines

### Adding New Tests

1. **Smoke Tests**: Critical path testing in `tests/smoke/`
2. **Integration Tests**: Full workflow testing in main test files
3. **Fixtures**: Mock data and applications in `tests/fixtures/`

### Best Practices

- Use descriptive test names with context
- Include proper error handling and timeouts
- Validate both success and failure scenarios
- Test with various image formats and sizes

## 🔄 CI/CD Integration

The framework is optimized for continuous integration:

- **Fast Execution**: Headless mode with optimized timeouts
- **Minimal Dependencies**: No external Azure SDKs required
- **Environment Flexibility**: Configurable for different CI systems
- **Error Reporting**: Detailed failure information and screenshots

```yaml
# Example GitHub Actions integration
- name: Run Tests
  run: npm test
  env:
    HEADLESS: true
    TEST_ENV: ci
```

### 📦 CI Artifacts

When tests fail in Pull Requests, debugging artifacts are automatically uploaded:

1. **HTML Reports**: 
   - Go to the failed GitHub Actions run
   - Scroll down to "Artifacts" section
   - Download `playwright-report-chromium` or `playwright-report-firefox`
   - Extract and open `index.html` in your browser

2. **Test Traces**: 
   - Download `playwright-traces-chromium` or `playwright-traces-firefox` from failed runs
   - Extract the `.zip` files containing `trace.zip` files
   - Open traces with: `npx playwright show-trace path/to/trace.zip`
   - Or drag & drop trace files into [trace.playwright.dev](https://trace.playwright.dev)

3. **Screenshots & Videos**:
   - Available in the HTML report under each failed test
   - Show exact failure points and browser state
   - Videos prove browser interactions occurred correctly

The artifacts are retained for 30 days and help diagnose CI-specific failures that don't reproduce locally.

## 📊 Monitoring and Metrics

Tests automatically validate:

- **Performance**: Response times and execution duration
- **Reliability**: Success/failure rates across test runs
- **Coverage**: Feature and integration test coverage
- **Quality**: Image validation and processing accuracy

## 🛠️ Development

### Local Development Setup

```bash
# Clone and setup
git clone <repository>
cd tomra
npm install

# Start development mode
npm run test:ui

# Serve mock applications
npm run serve:mock
```

### Adding Image Samples

```bash
# Add test images
mkdir -p data/samples/images
cp your-image.jpg data/samples/images/

# Test with your images
npm run test:headed tests/smoke/upload.smoke.test.mjs
```

## 📝 License

Internal TOMRA project - See company guidelines for usage and distribution.