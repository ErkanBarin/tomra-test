# Sample Images

This directory is for user-provided image files to be used in upload tests.

## Usage

Drop your own JPG or PNG files here to test real image uploads:

```bash
# Example:
cp your-image.jpg data/samples/images/
# or
cp your-photo.png data/samples/images/
```

## Supported Formats

- `.jpg` and `.jpeg` files
- `.png` files

## Test Behavior

- **If images exist**: The upload smoke tests will use the first image found
- **If empty**: Tests will skip upload functionality with a clear message

## Example

```bash
# Copy a sample image
cp ~/Pictures/sample.jpg data/samples/images/

# Run headed tests to see your image being uploaded
pnpm run test:headed
```

The tests will automatically detect any images in this folder and use them during upload testing.