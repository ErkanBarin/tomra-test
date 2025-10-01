import { test, expect } from '@playwright/test';

/**
 * Simple working smoke tests for demo purposes
 * These tests demonstrate browser automation with actual visible actions
 */

test.describe('Demo Smoke Tests', () => {
  
  test('should open upload page and show interface @smoke @demo', async ({ page }) => {
    console.log('🚀 Starting demo upload test...');
    
    // Navigate to the upload page
    await page.goto('http://127.0.0.1:5173/upload.html');
    
    // Wait to see the page load
    await page.waitForTimeout(2000);
    
    // Verify page loaded
    await expect(page).toHaveTitle(/Upload/i);
    console.log('✓ Upload page loaded successfully');
    
    // Wait for demo visibility
    await page.waitForTimeout(2000);
    
    // Verify key elements are present
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.getByTestId('upload-submit-button');
    
    await expect(fileInput).toBeVisible();
    await expect(uploadButton).toBeVisible();
    
    console.log('✓ Upload interface elements are visible');
    
    // Add visible demo interactions
    console.log('📍 Hovering over file input...');
    await fileInput.hover();
    await page.waitForTimeout(2000);
    
    console.log('📍 Hovering over upload button...');
    await uploadButton.hover();
    await page.waitForTimeout(2000);
    
    // Click to show interaction
    console.log('📍 Clicking file input to show file dialog...');
    await fileInput.click();
    await page.waitForTimeout(1000);
    
    // Press Escape to close dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);
    
    console.log('✓ Demo interactions completed');
  });
  
  test('should open training page and show interface @smoke @demo', async ({ page }) => {
    console.log('🚀 Starting demo training test...');
    
    // Navigate to the training page
    await page.goto('http://127.0.0.1:5173/training.html');
    
    // Wait to see the page load
    await page.waitForTimeout(2000);
    
    // Verify page loaded
    await expect(page).toHaveTitle(/Training/i);
    console.log('✓ Training page loaded successfully');
    
    // Wait for demo visibility
    await page.waitForTimeout(2000);
    
    // Look for training-related elements
    const startButton = page.locator('button:has-text("Start"), button:has-text("Train")');
    
    if (await startButton.count() > 0) {
      await expect(startButton.first()).toBeVisible();
      
      console.log('📍 Hovering over training button...');
      await startButton.first().hover();
      await page.waitForTimeout(2000);
      
      console.log('📍 Clicking training button...');
      await startButton.first().click();
      await page.waitForTimeout(2000);
      
      console.log('✓ Training controls found and interactive');
    } else {
      console.log('✓ Training page rendered (controls may vary)');
    }
    
    // Add more visible interactions
    console.log('📍 Scrolling page...');
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(2000);
    
    console.log('✓ Demo training test completed');
  });

  test('should navigate between pages @smoke @demo', async ({ page }) => {
    console.log('🚀 Starting demo navigation test...');
    
    // Test navigation between different pages
    const pages = [
      { url: 'http://127.0.0.1:5173/upload.html', name: 'Upload' },
      { url: 'http://127.0.0.1:5173/training.html', name: 'Training' },
      { url: 'http://127.0.0.1:5173/registry.html', name: 'Registry' }
    ];
    
    for (const pageInfo of pages) {
      console.log(`  📍 Navigating to ${pageInfo.name} page...`);
      
      await page.goto(pageInfo.url);
      await page.waitForTimeout(2000); // Wait to see the navigation
      
      // Verify the page loaded
      await expect(page).toHaveURL(pageInfo.url);
      console.log(`  ✓ ${pageInfo.name} page loaded successfully`);
      
      // Add some visible interactions on each page
      console.log(`  📍 Interacting with ${pageInfo.name} page...`);
      
      // Scroll to show page content
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(1000);
      await page.mouse.wheel(0, -200);
      await page.waitForTimeout(1000);
      
      // Try to hover over any buttons or inputs on the page
      const buttons = page.locator('button, input[type="submit"]');
      const inputs = page.locator('input[type="file"], input[type="text"]');
      
      if (await buttons.count() > 0) {
        console.log(`  📍 Hovering over buttons on ${pageInfo.name} page...`);
        await buttons.first().hover();
        await page.waitForTimeout(1000);
      }
      
      if (await inputs.count() > 0) {
        console.log(`  📍 Hovering over inputs on ${pageInfo.name} page...`);
        await inputs.first().hover();
        await page.waitForTimeout(1000);
      }
      
      await page.waitForTimeout(1500); // Pause to observe the page
    }
    
    console.log('✓ Demo navigation test completed');
  });
});