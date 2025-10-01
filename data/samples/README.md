# Test Data Directory

This directory contains sample data files for testing the Tomra Food MLOPS Platform.

## Sample Images

### Required Test Images
- `apple_01.jpg` - Primary test image for upload workflows
- `banana_01.jpg` - Secondary test image for batch uploads  
- `orange_01.jpg` - Third test image for format validation

### Image Requirements
- **File Size**: < 1MB each for CI performance
- **Formats**: JPEG, PNG, WebP supported
- **Dimensions**: Minimum 224x224 pixels
- **Content**: Food images for classification testing

### Usage in Tests
Tests will automatically skip if required images are missing, printing guidance on where to obtain them.

```bash
# Example test output when images are missing:
⚠️  Test data missing: tests/fixtures/images/apple.jpg
   Please add sample food images to continue with upload tests.
   Images should be < 1MB, JPEG/PNG format, food-related content.
```

## Mock Data Files
- `sample.pdf` - Used for testing unsupported file type validation
- `huge_image.jpg` - Used for testing file size limit validation (if present)

## Environment Setup
For local testing, ensure test images are present:

```bash
# Check for required test images
ls -la tests/fixtures/images/
ls -la data/samples/

# Images can be any food photos meeting size/format requirements
# Tests are designed to work with any valid images matching the naming pattern
```

## CI/CD Considerations
- Images are not committed to repository (too large)
- Tests gracefully skip upload scenarios when images are missing
- CI uses mocked responses for blob verification instead of real uploads
- Real Azure integration only runs in designated test environments