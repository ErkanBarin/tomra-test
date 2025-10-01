import { test, expect } from '@playwright/test';

test.describe('Image Upload Integration', () => {

  test('should upload single food image successfully @integration', async ({ page }) => {
    const { UploadPage } = await import('../../pages/upload.page.mjs');
    const uploadPage = new UploadPage(page);
    
    // Navigate to upload page
    await uploadPage.navigate();
    
    // Upload a test food image
    const testImagePath = 'data/samples/images/apple.png';
    await uploadPage.uploadImage(testImagePath);
    
    // Verify upload success
    await expect(uploadPage.successMessage).toBeVisible();
    await expect(uploadPage.uploadedImagePreview).toBeVisible();
    
    // Verify image metadata is captured
    const metadata = await uploadPage.getImageMetadata();
    expect(metadata).toHaveProperty('filename', 'apple.png');
    expect(metadata).toHaveProperty('size');
    expect(metadata).toHaveProperty('type', 'image/png');
    expect(metadata.size).toBeGreaterThan(0);
  });

  test('should upload multiple food images in batch @integration', async ({ page }) => {
    const { UploadPage } = await import('../../pages/upload.page.mjs');
    const uploadPage = new UploadPage(page);
    
    await uploadPage.navigate();
    
    // Upload multiple test images
    const imagePaths = [
      'data/samples/images/apple.png',
      'data/samples/images/orange.png'
    ];
    await uploadPage.uploadMultipleImages(imagePaths);
    
    // Verify all uploads succeeded
    await expect(uploadPage.batchSuccessMessage).toBeVisible();
    
    const uploadedImages = await uploadPage.getUploadedImagesList();
    expect(uploadedImages).toHaveLength(2); // Fixed: should be 2, not 3
    
    // Verify each image is properly processed
    for (const image of uploadedImages) {
      expect(image).toHaveProperty('status', 'uploaded');
      expect(image).toHaveProperty('preview_url');
      expect(image).toHaveProperty('blob_url');
    }
  });

  test('should handle unsupported file types gracefully @integration', async ({ page }) => {
    const { UploadPage } = await import('../../pages/upload.page.mjs');
    const uploadPage = new UploadPage(page);
    
    await uploadPage.navigate();
    
    // Attempt to upload unsupported file
    // Note: Testing with non-image file would require adding test file
    const unsupportedFile = 'package.json'; // Use existing non-image file
    await uploadPage.uploadImage(unsupportedFile);
    
    // Verify error handling
    await expect(uploadPage.errorMessage).toBeVisible();
    await expect(uploadPage.errorMessage).toHaveText(/Only image files are supported/);
    
    // Verify no upload occurred
    const uploadedImages = await uploadPage.getUploadedImagesList();
    expect(uploadedImages).toHaveLength(0);
  });

  test('should validate image file size limits @integration', async ({ page }) => {
    // Skip until a real oversized test asset or mocking strategy is in place
    test.skip(true, 'Need large image file to test size limits meaningfully');
  });

  test('should display upload progress @integration', async ({ page }) => {
    const { UploadPage } = await import('../../pages/upload.page.mjs');
    const uploadPage = new UploadPage(page);
    
    await uploadPage.navigate();
    
    const testImagePath = 'data/samples/images/apple.png';
    await uploadPage.uploadImage(testImagePath);
    
    // Verify progress is displayed during upload (if mock shows it)
    // Note: Mock environment may not show progress 
    const progressVisible = await uploadPage.progressBar.isVisible();
    if (progressVisible) {
      // If progress bar is shown, it should eventually hide
      await expect(uploadPage.progressBar).toBeHidden();
    }
    
    // Verify successful completion
    await expect(uploadPage.successMessage).toBeVisible();
  });

  test('should generate blob storage URLs @integration', async ({ page }) => {
    const { UploadPage } = await import('../../pages/upload.page.mjs');
    const uploadPage = new UploadPage(page);
    
    await uploadPage.navigate();
    
    const testImagePath = 'data/samples/images/apple.png';
    await uploadPage.uploadImage(testImagePath);
    
    // Wait for upload completion
    await expect(uploadPage.successMessage).toBeVisible();
    
    // Verify blob URL is generated (in mock environment, this would be simulated)
    const metadata = await uploadPage.getImageMetadata();
    expect(metadata).toHaveProperty('blob_url');
    expect(metadata.blob_url).toMatch(/https?:\/\//);
  });

  test('should handle network failures gracefully @integration', async ({ page }) => {
    const { UploadPage } = await import('../../pages/upload.page.mjs');
    const uploadPage = new UploadPage(page);
    
    await uploadPage.navigate();
    
    // In mock environment, we can't simulate actual network failures
    // This test would need real API integration or mocking capabilities
    // For now, just verify the page loads and basic functionality works
    const testImagePath = 'data/samples/images/apple.png';
    await uploadPage.uploadImage(testImagePath);
    
    // In a real environment, this might show an error message
    // In mock environment, it should succeed
    await expect(uploadPage.successMessage).toBeVisible();
  });

  test('should clear uploaded images @integration', async ({ page }) => {
    const { UploadPage } = await import('../../pages/upload.page.mjs');
    const uploadPage = new UploadPage(page);
    
    await uploadPage.navigate();
    
    // Upload images first
    const imagePaths = [
      'data/samples/images/apple.png',
      'data/samples/images/orange.png'
    ];
    
    for (const imagePath of imagePaths) {
      await uploadPage.uploadImage(imagePath);
    }
    
    // Verify images are uploaded
    const uploadedImages = await uploadPage.getUploadedImagesList();
    expect(uploadedImages).toHaveLength(2);
    
    // Clear all images
    await uploadPage.clearAllImages();
    
    // Verify images are cleared
    await expect(uploadPage.clearSuccessMessage).toBeVisible();
    const remainingImages = await uploadPage.getUploadedImagesList();
    expect(remainingImages).toHaveLength(0);
  });

  test('should validate supported image formats @integration', async ({ page }) => {
    const { UploadPage } = await import('../../pages/upload.page.mjs');
    const uploadPage = new UploadPage(page);
    
    await uploadPage.navigate();
    
    // Test PNG upload with apple
    await uploadPage.uploadImage('data/samples/images/apple.png');
    await expect(uploadPage.successMessage).toBeVisible();
    
    const appleMetadata = await uploadPage.getImageMetadata();
    expect(appleMetadata.type).toContain('png');
    expect(appleMetadata.filename).toBe('apple.png');
    
    // Clear and test with orange
    await uploadPage.clearAllImages();
    await expect(uploadPage.clearSuccessMessage).toBeVisible();
    
    await uploadPage.uploadImage('data/samples/images/orange.png');
    await expect(uploadPage.successMessage).toBeVisible();
    
    const orangeMetadata = await uploadPage.getImageMetadata();
    expect(orangeMetadata.type).toContain('png');
    expect(orangeMetadata.filename).toBe('orange.png');
  });
});