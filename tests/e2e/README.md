# End-to-End (E2E) Tests

## Overview
End-to-End tests verify complete user workflows from start to finish, testing the entire application stack as close to production as possible.

## What E2E Tests Cover

### 🎯 Complete User Journeys
- **Real file uploads** with actual image files (`apple.png`, `orange.png`)
- **Full business workflows** from upload to completion
- **Cross-page navigation** testing entire user flows
- **Visual demonstrations** with detailed console logging

### 🔄 End-to-End Scenarios
- Upload single food image with metadata validation
- Batch upload multiple images with success verification  
- Error handling with invalid file types
- Navigation between upload, training, and registry pages
- Complete workflow validation with real UI interactions

## E2E vs Integration vs Smoke

| Aspect | E2E Tests | Integration Tests | Smoke Tests |
|---|---|---|---|
| **Scope** | Full user journeys | Component interactions | Basic health checks |
| **Services** | Real/production-like | Mocked backend | Minimal dependencies |
| **Files** | Real file uploads | Mock file handling | Existence checks |
| **Speed** | Slower (comprehensive) | Medium (focused) | Fast (basic) |
| **Purpose** | User acceptance | Component integration | "Does it run?" |

## Test Structure

### Demo E2E Tests (`demo.e2e.test.mjs`)
These tests provide **visual demonstrations** of complete TOMRA workflows:

```javascript
test('should demonstrate complete upload workflow end-to-end @e2e @demo', async ({ page }) => {
  // Real file upload
  await fileInput.setInputFiles('data/samples/images/apple.png');
  await uploadButton.click();
  
  // Complete workflow validation
  await expect(successMessage).toBeVisible();
  await expect(imagePreview).toBeVisible();
  
  // Metadata verification
  const metadata = await uploadPage.getImageMetadata();
  expect(metadata.filename).toBe('apple.png');
});
```

## Running E2E Tests

```bash
# Run all E2E tests
npx playwright test tests/e2e/ --project=chromium

# Run specific E2E demo
npx playwright test tests/e2e/demo.e2e.test.mjs --grep="complete upload workflow"

# Run with visual browser (great for demos)
HEADLESS=false npx playwright test tests/e2e/
```

## When to Add E2E Tests

✅ **Add E2E tests for:**
- Complete user workflows
- Critical business processes
- Cross-component integrations
- User acceptance scenarios
- Demo/showcase capabilities

❌ **Don't use E2E tests for:**
- Unit logic testing
- Quick health checks
- Component isolation testing
- Development TDD workflows

## Current E2E Test Coverage

- ✅ **Complete upload workflow** - Single image with metadata
- ✅ **Batch upload workflow** - Multiple images with validation  
- ✅ **Error handling workflow** - Invalid file type processing
- ✅ **Navigation workflow** - Cross-page user journeys
- 🔄 **Training workflow** - Planned for ML pipeline integration
- 🔄 **Registry workflow** - Planned for model management

E2E tests ensure the TOMRA food analysis system works correctly for real users in realistic scenarios.