import { test, expect } from '@playwright/test';
import { readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Smoke tests for file upload functionality
 * These tests verify the core upload features work end-to-end
 */

/**
 * Find image files in directory using Node.js native APIs
 */
async function findImageFiles(dir) {
  try {
    const files = await readdir(dir);
    const imageFiles = [];
    
    for (const file of files) {
      if (file === 'README.md') continue;
      
      const filePath = join(dir, file);
      const stats = await stat(filePath);
      
      if (stats.isFile() && /\.(jpe?g|png)$/i.test(file)) {
        imageFiles.push(file);
      }
    }
    
    return imageFiles;
  } catch {
    return [];
  }
}

test.describe('Upload Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup will be implemented when page objects are created
  });

  test('should upload image file successfully @smoke', async ({ page }) => {
    // Check if UploadPage module exists before running test
    const uploadPagePath = 'pages/upload.page.mjs';
    if (!existsSync(uploadPagePath)) {
      test.skip(true, `UploadPage module not found: ${uploadPagePath} - implementation incomplete`);
      return;
    }
    
    const { UploadPage } = await import('../../pages/upload.page.mjs');
    const uploadPage = new UploadPage(page);
    
    await uploadPage.navigate();
    
    // Check for real user-provided images first
    const samplesDir = 'data/samples/images';
    const imageFiles = await findImageFiles(samplesDir);
    
    let testImagePath;
    let isRealImage = false;
    
    if (imageFiles.length > 0) {
      // Use first real image found
      testImagePath = join(samplesDir, imageFiles[0]);
      isRealImage = true;
      console.log(`✓ Using real image: ${testImagePath}`);
    } else {
      // Skip test gracefully when no images available
      console.log('⚠️ No sample images found in data/samples/images/');
      console.log('   Add JPG or PNG files to test real image uploads');
      test.skip(true, 'No sample images available - add JPG/PNG files to data/samples/images/');
      return;
    }
    
    // Verify file exists before upload attempt
    if (!existsSync(testImagePath)) {
      test.skip(true, `Sample image not found: ${testImagePath}`);
      return;
    }
    
    // Upload the image
    await uploadPage.uploadImage(testImagePath);
    
    // Verify upload success indicators
    await expect(uploadPage.successMessage).toBeVisible();
    await expect(uploadPage.uploadedImagePreview).toBeVisible();
    
    // Verify image metadata for real images
    if (isRealImage) {
      const metadata = await uploadPage.getImageMetadata();
      expect(metadata).toHaveProperty('filename');
      expect(metadata).toHaveProperty('size');
      expect(metadata).toHaveProperty('type');
      expect(metadata.size).toBeGreaterThan(0);
      
      // Verify content type is image/*
      expect(metadata.type).toMatch(/^image\//);
      console.log(`✓ Uploaded ${metadata.filename} (${metadata.size} bytes, ${metadata.type})`);
    }
    
    // Verify blob storage interaction (may be mocked)
    await expect(uploadPage.blobUrlDisplay).toBeVisible();
    const blobUrl = await uploadPage.getBlobUrl();
    expect(blobUrl).toBeTruthy();
    console.log(`✓ Blob URL generated: ${blobUrl}`);
  });

  test('should handle upload errors gracefully @smoke', async ({ page }) => {
    // Narrow try/catch to only handle module import errors
    let UploadPage;
    try {
      ({ UploadPage } = await import('../../pages/upload.page.mjs'));
    } catch (error) {
      // Only tolerate module-not-found errors, rethrow others
      if (error.code === 'ERR_MODULE_NOT_FOUND' || 
          error.message.includes('Cannot find module') ||
          error.message.includes('Cannot resolve module')) {
        test.skip(true, 'UploadPage module not found - implementation incomplete');
        return;
      }
      // Rethrow any other import errors (syntax errors, etc.)
      throw error;
    }
    
    const uploadPage = new UploadPage(page);
    
    await uploadPage.navigate();
    
    // Test with invalid file type (should show error)
    const invalidFilePath = 'package.json'; // Not an image
    await uploadPage.uploadImage(invalidFilePath);
    
    // Verify error handling
    await expect(uploadPage.errorMessage).toBeVisible();
    
    const errorText = await uploadPage.getErrorMessage();
    expect(errorText.toLowerCase()).toContain('invalid');
  });
});