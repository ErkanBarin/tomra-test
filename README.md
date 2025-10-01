# TOMRA Playwright ESM Test Automation

A comprehensive Playwright test automation framework for TOMRA's MLOps pipeline, built with ES Modules and Node.js 20.x.

## 🎯 Features

- **Browser Automation**: Playwright-powered testing across multiple browsers
- **Azure Integration**: Blob storage verification and ML job monitoring
- **Real Image Processing**: Upload and validate JPG/PNG images
- **Demo-Friendly**: Headed mode and UI testing for demonstrations
- **CI/CD Ready**: Headless execution optimized for continuous integration

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run tests (headless mode)
npm test

# Run tests with browser UI for demos
npm run test:headed

# Run interactive test development
npm run test:ui
```

## 📁 Project Structure

```
src/
├── tests/
│   ├── smoke/           # Smoke tests including real image uploads
│   ├── fixtures/        # Test fixtures and mock applications
│   └── *.test.mjs      # Core test suites
├── utils/
│   └── azure.mjs       # Azure utilities (Storage & ML)
├── config/
│   └── env.mjs         # Environment configuration
├── scripts/
│   └── serve-mock.mjs  # Static server for mock apps
└── data/
    └── samples/
        └── images/     # Real image samples for testing
```

## 🎬 Watch it Run

For demonstrations and debugging, use the headed mode to see tests execute in real browsers:

```bash
# Watch tests run in browser windows
npm run test:headed

# Interactive test development with Playwright UI
npm run test:ui

# Serve mock applications locally
npm run serve:mock
```

### Environment Configuration

Control test behavior with environment variables:

```bash
# Run with browser UI visible
HEADLESS=false npm test

# Use mock server instead of fixtures
MOCK_APP=true npm test

# Combine options for demos
HEADLESS=false MOCK_APP=true npm run test:headed
```

## 📸 Use Your Own Images

Test with real images by placing JPG or PNG files in `data/samples/images/`:

```bash
# Add your images
mkdir -p data/samples/images
cp /path/to/your/image.jpg data/samples/images/
cp /path/to/your/image.png data/samples/images/

# Run upload tests with real images
npm run test:headed tests/smoke/upload.smoke.test.mjs
```

### Supported Image Formats

- **JPG/JPEG**: Standard photo format
- **PNG**: Lossless compression format
- **Size Limit**: 10MB maximum per image
- **Validation**: Automatic content-type detection

The smoke tests will automatically discover and test all images in the samples directory, providing detailed validation results for each file.

## 🧪 Test Execution

### Standard Test Modes

```bash
# Run all tests (CI mode)
npm test

# Run specific test file
npm test tests/smoke/upload.smoke.test.mjs

# Run tests with pattern matching
npm test -- --grep "upload"
```

### Demo and Development Modes

```bash
# Interactive browser testing
npm run test:headed

# Playwright test UI for development
npm run test:ui

# Start mock server for manual testing
npm run serve:mock
# Then visit http://127.0.0.1:5173/upload.html
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HEADLESS` | Run browsers in headless mode | `true` |
| `MOCK_APP` | Use local mock server | `false` |
| `TEST_ENV` | Test environment identifier | `ci` |
| `AZURE_STORAGE_*` | Azure Storage configuration | (optional) |

### Playwright Configuration

The `playwright.config.mjs` automatically adapts based on environment:

- **CI Mode**: Headless, fast execution, minimal output
- **Demo Mode**: Headed browsers, slower execution, detailed logging
- **Development**: UI mode with interactive debugging

## 🏗️ Azure Integration

### Blob Storage Verification

```javascript
import { BlobVerificationUtils } from './utils/azure.mjs';

const blobUtils = new BlobVerificationUtils();
const result = await blobUtils.verifyBlobExists(sasUrl);
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