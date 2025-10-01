# Test Data Directory

This directory contains sample data files for testing the Tomra Food MLOPS Platform.

## 📁 Sample Images (`images/` subdirectory)

### Adding Your Own Images
Drop your own JPG or PNG files into `data/samples/images/` to test real image uploads:

```bash
# Example:
cp your-food-image.jpg data/samples/images/
cp your-photo.png data/samples/images/

# Check what images you have
ls -la data/samples/images/
```

### Supported Formats
- **JPEG**: `.jpg` and `.jpeg` files
- **PNG**: `.png` files  
- **File Size**: < 10MB each (recommended < 1MB for CI performance)
- **Dimensions**: Minimum 224x224 pixels recommended
- **Content**: Food images work best for classification testing

### Test Behavior
- **If images exist**: Upload tests will automatically discover and use your images
- **If empty**: Tests will skip upload functionality with clear guidance
- **Multiple images**: Tests will use the first image found, or multiple for batch testing

### Usage Examples

```bash
# Add sample images
mkdir -p data/samples/images
cp ~/Pictures/apple.jpg data/samples/images/
cp ~/Downloads/food-photo.png data/samples/images/

# Run headed tests to see your images being uploaded
npm run test:headed tests/smoke/upload.smoke.test.mjs

# Run comprehensive upload demos
npm run test:demo:show
```

### Recommended Test Images
For optimal testing experience, consider adding:
- `apple.jpg` - Primary test image for single uploads
- `orange.png` - Secondary image for batch upload testing  
- `food-mix.jpg` - Additional image for variety testing

## 🗂️ Mock Data Files
- `sample.pdf` - Used for testing unsupported file type validation
- `large-file.jpg` - Used for testing file size limit validation (if present)

## 🔧 Environment Setup
For local testing, ensure your test environment is ready:

```bash
# Check current test data
ls -la data/samples/
ls -la data/samples/images/

# Add your own images
cp /path/to/your/food-images/* data/samples/images/

# Verify tests can find your images
npm run test:smoke
```

## 🚀 CI/CD Considerations
- **Images not committed**: Too large for repository, added to .gitignore
- **Graceful fallback**: Tests skip upload scenarios when images missing
- **Mock responses**: CI uses mocked blob verification instead of real uploads
- **Real Azure integration**: Only runs in designated test environments with proper credentials

## 📊 Test Integration
The upload tests automatically:
- Discover all images in `data/samples/images/`
- Validate file formats and sizes
- Display detailed upload progress and results
- Generate blob storage URLs and metadata
- Verify successful Azure integration (when configured)