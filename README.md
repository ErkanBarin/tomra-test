# TOMRA MLOps Test Automation Suite

A comprehensive Playwright test automation framework for TOMRA's MLOps pipeline, featuring complete End-to-End testing of upload workflows and Model Registry management with ML performance validation.

## 🎯 Features

- **Complete MLOps Testing**: Upload workflows + Model Registry management
- **ML Quality Validation**: F1 score monitoring and performance thresholds
- **Browser Automation**: Playwright-powered testing across multiple browsers
- **Azure Integration**: Blob storage verification and ML job monitoring
- **Real Image Processing**: Upload and validate JPG/PNG images
- **Business Intelligence**: Model quality analytics and compliance features
- **Demo-Friendly**: Sequential E2E demos perfect for stakeholder presentations
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
├── .github/             # GitHub workflows and automation
├── pages/               # Page Object Model classes
│   ├── upload.page.mjs
│   ├── training.page.mjs  
│   └── model-registry.page.mjs
├── tests/
│   ├── smoke/           # Smoke tests including real image uploads
│   ├── fixtures/        # Test fixtures and mock applications
│   │   └── mock-app/    # Static HTML applications for testing
│   └── integration/     # Integration test suites
├── utils/
│   ├── azure.mjs        # Azure utilities (Storage & ML)
│   └── waitFor.mjs      # Async utilities and timeouts
├── scripts/
│   ├── serve-mock.mjs   # Static server for mock apps
│   ├── demo.mjs         # Demo automation scripts
│   └── demo-fast.mjs    # Fast demo version
├── config/
│   └── env.*.mjs        # Environment configurations
└── data/
    └── samples/
        └── images/      # Real image samples for testing
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

### Test Suite Categories

```bash
# Run all tests by category
npm run test:smoke        # Quick functionality validation
npm run test:integration  # Full workflow testing
npm run test:e2e         # End-to-end user journeys
npm run test:all         # Complete test suite

# Demo commands for presentations
npm run test:demo        # All demo tests (headless)
npm run test:demo:headed # All demo tests (visible browser)
npm run test:demo:show   # E2E demos only (sequential, perfect for live demos)
```

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

## 🎯 E2E Test Coverage

Our comprehensive End-to-End test suite demonstrates complete MLOps workflows:

### 📤 **Upload Workflow Tests**
- **Complete Upload Journey**: Single image upload with validation
- **Batch Upload Processing**: Multiple images with progress tracking
- **Error Handling**: Invalid file type validation and user feedback
- **Azure Integration**: Blob storage verification and metadata validation

### 🤖 **Model Registry Tests**
- **Model Browsing**: View all registered ML models with metadata
- **Advanced Search**: Find models by name, version, or criteria
- **Status Filtering**: Filter Active/Deprecated models for deployment control
- **Performance Sorting**: Sort by F1 score and quality metrics
- **Real-time Refresh**: Live data updates and timestamp validation
- **Business Intelligence**: Quality ratio analysis and compliance features

### 🧭 **Navigation & Platform Tests**
- **Cross-Platform Navigation**: Upload → Training → Registry workflows
- **UI Component Validation**: Interactive elements and responsive design
- **Feature Discovery**: Button interactions and form validations

## 📊 ML Model Quality Validation

### F1 Score Monitoring
The Model Registry E2E tests validate **F1 Score** performance metrics:

**What is F1 Score?**
- **F1 = 2 × (Precision × Recall) / (Precision + Recall)**
- **Precision**: Of all items classified as "apple", how many are actually apples?
- **Recall**: Of all actual apples, how many did we correctly identify?
- **Balanced Measure**: Combines both precision and recall for overall model quality

**Quality Thresholds in Tests:**
```javascript
// Automated F1 score validation
✅ F1 Score ≥ 0.92 = High Quality Model (production ready)
⚠️  F1 Score < 0.92 = Needs improvement
📊 Quality Ratio: % of models meeting threshold
```

**Business Value Demonstration:**
- **Food Safety**: High precision prevents contaminated items from passing
- **Efficiency**: High recall ensures good food isn't wasted  
- **Compliance**: Audit trails for model performance and deployment decisions
- **Quality Assurance**: Automated validation of 50%+ high-performance models

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