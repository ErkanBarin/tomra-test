# Integration Tests

## Overview
Integration tests verify that different components of the TOMRA food image upload system work together correctly in realistic user scenarios. These tests use a mock server to simulate Azure backend services while testing real UI interactions.

## What We Test

### 🎯 Core Upload Workflows
- **Single Image Upload** - Primary user workflow with food images (`apple.png`)
- **Batch Upload** - Multiple image processing (`apple.png` + `orange.png`)
- **Metadata Extraction** - Filename, size, type validation

### 🛡️ Error Handling
- **File Type Validation** - Rejects non-images (e.g., `package.json`)
- **Network Failures** - Graceful degradation when services unavailable
- **User Feedback** - Clear error messages and success indicators

### 📊 User Experience
- **Upload Progress** - Progress bar display and hiding after completion
- **Image Management** - Upload list tracking and clear functionality
- **Format Support** - PNG validation with dynamic filename handling

### 🔗 Azure Integration
- **Blob Storage URLs** - Valid HTTPS URLs for uploaded images
- **Metadata Accuracy** - Correct file information for ML pipeline

### 🤖 ML Training Pipeline (Future)
- **`training-pipeline.integration.test.mjs`** - Tests for ML model training workflows
- **Status**: TDD-style tests written but not implemented yet
- **Purpose**: Train food classification models using uploaded images
- **Features**: Azure ML integration, progress monitoring, model registration

## How It Works

### Test Structure
```javascript
test('should upload single food image successfully @integration', async ({ page }) => {
  const { UploadPage } = await import('../../pages/upload.page.mjs');
  const uploadPage = new UploadPage(page);
  
  await uploadPage.navigate();
  await uploadPage.uploadImage('data/samples/images/apple.png');
  
  await expect(uploadPage.successMessage).toBeVisible();
  const metadata = await uploadPage.getImageMetadata();
  expect(metadata.filename).toBe('apple.png');
});
```

### Page Object Pattern
- **UploadPage** - Encapsulates UI interactions and element selectors
- **Mock Server** - Simulates Azure services with realistic responses
- **Test Data** - Real image files (`apple.png`, `orange.png`) in `data/samples/images/`

### Mock Functionality
The enhanced mock server provides:
- ✅ Dynamic file metadata based on actual uploads
- ✅ Multiple file upload support with batch messaging
- ✅ Client-side validation for file types
- ✅ Progress indication that hides when complete
- ✅ Image list management with clear functionality

## Running Tests

```bash
# Run all integration tests
npx playwright test tests/integration/ --project=chromium

# Run specific test
npx playwright test tests/integration/image-upload.integration.test.mjs --grep="single food image"

# Run with mock server
MOCK_APP=true npx playwright test tests/integration/
```

## Why Integration Tests Matter

**vs Unit Tests**: Test component interactions, not isolated functions  
**vs E2E Tests**: Faster and more reliable with mocked external services  
**vs Manual Testing**: Automated verification of complex user workflows

Integration tests ensure the food image upload system works correctly for real users without requiring complex Azure setup for every test run.

## Test Coverage

- ✅ **8 passing tests** covering all major workflows
- ✅ **Error scenarios** handled gracefully
- ✅ **User feedback** validated
- ✅ **Business rules** enforced
- ⏭️ **File size limits** (planned - needs large test file)

Each test represents a critical user journey in the TOMRA food analysis pipeline.