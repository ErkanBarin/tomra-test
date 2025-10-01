# Test Fixtures

This directory contains test data and mock applications used by the test suite.

## Structure

```
tests/fixtures/
└── mock-app/            # Mock web application for testing
    ├── index.html       # Landing page
    ├── upload.html      # Upload interface
    ├── train.html       # Training page
    ├── deploy.html      # Deployment page
    └── styles.css       # Basic styling
```

## Mock Application
- **Purpose**: Provides a test web application that simulates the TOMRA Food MLOPS Platform
- **Usage**: Used by smoke tests and demo scripts to verify UI automation
- **Served by**: `scripts/serve-mock.mjs` on port 3000
- **Features**: Simple HTML pages with proper test IDs and basic styling

## Test Data Files
Test images and other data files are now located in:
- `data/samples/images/` - Sample food images (apple.png, orange.png)
- Real test data used by working smoke tests and demo scripts

## Previous Structure (Cleaned Up)
The following directories were removed to eliminate redundancy:
- ~~`tests/fixtures/images/`~~ → moved to `data/samples/images/`
- ~~`tests/fixtures/documents/`~~ → removed (was only used in placeholder tests)

## Local Development
```bash
# Start the mock application
npm run serve:mock

# Run smoke tests with real images
npm run test:smoke

# Run visible browser demo
npm run demo:tomra
```

## CI/CD
- Mock application is served automatically during test runs
- Real test images are committed in `data/samples/images/`
- Integration tests are placeholder/TDD tests that skip until implementation is complete