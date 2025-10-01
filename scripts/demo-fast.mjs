import { chromium } from 'playwright';

async function runFastTomraDemo() {
  console.log('🚀 STARTING FAST TOMRA DEMO - LAUNCHING VISIBLE BROWSER...');
  
  // Start mock server first
  console.log('📡 Starting mock server...');
  const { spawn } = await import('child_process');
  const serverProcess = spawn('node', ['scripts/serve-mock.mjs'], { 
    stdio: 'pipe',
    cwd: process.cwd()
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('✅ Mock server should be running on http://127.0.0.1:5173');
  
  // Launch browser with faster settings
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500, // Even faster - 500ms delay
    devtools: false,
    args: ['--start-maximized', '--no-sandbox']
  });
  
  console.log('✅ Browser launched! You should see Chromium window now!');
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Demo 1: Upload Page (no file dialog)
    console.log('\n🎬 === DEMO 1: UPLOAD PAGE ===');
    console.log('📄 Navigating to Upload page...');
    await page.goto('http://127.0.0.1:5173/upload.html');
    
    console.log('⏰ Upload page visible for 2 seconds...');
    await page.waitForTimeout(2000);
    
    console.log('🎯 Finding and hovering over file input...');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.hover();
    await page.waitForTimeout(1000);
    
    console.log('🎯 Finding and hovering over upload button...');
    const uploadButton = page.getByTestId('upload-submit-button');
    await uploadButton.hover();
    await page.waitForTimeout(1000);
    
    console.log('👆 Clicking upload button (safe interaction)...');
    await uploadButton.click();
    await page.waitForTimeout(1000);
    
    // Demo 2: Training Page
    console.log('\n🎬 === DEMO 2: TRAINING PAGE ===');
    console.log('📄 Navigating to Training page...');
    await page.goto('http://127.0.0.1:5173/training.html');
    await page.waitForTimeout(2000);
    
    console.log('🎯 Looking for training buttons...');
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`📊 Found ${buttonCount} buttons on page`);
    
    if (buttonCount > 0) {
      console.log('👆 Hovering and clicking first button...');
      await buttons.first().hover();
      await page.waitForTimeout(800);
      await buttons.first().click();
      await page.waitForTimeout(1200);
    }
    
    // Demo 3: Registry Page
    console.log('\n🎬 === DEMO 3: REGISTRY PAGE ===');
    console.log('📄 Navigating to Registry page...');
    await page.goto('http://127.0.0.1:5173/registry.html');
    await page.waitForTimeout(2000);
    
    console.log('📜 Quick scroll demonstration...');
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(800);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(800);
    
    // Demo 4: Final multi-page navigation
    console.log('\n🎬 === DEMO 4: QUICK PAGE NAVIGATION ===');
    
    const pages = [
      'http://127.0.0.1:5173/upload.html',
      'http://127.0.0.1:5173/training.html', 
      'http://127.0.0.1:5173/registry.html'
    ];
    
    for (let i = 0; i < pages.length; i++) {
      console.log(`📄 Quick visit to page ${i + 1}/3...`);
      await page.goto(pages[i]);
      await page.waitForTimeout(1500);
      
      // Quick interaction on each page
      const pageButtons = page.locator('button, input[type="submit"]');
      if (await pageButtons.count() > 0) {
        await pageButtons.first().hover();
        await page.waitForTimeout(500);
      }
    }
    
    console.log('\n🎬 === FAST DEMO COMPLETED ===');
    console.log('⏰ Browser will close in 2 seconds...');
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('❌ Demo error:', error.message);
  } finally {
    console.log('🔒 Closing browser...');
    await browser.close();
    
    console.log('🛑 Stopping mock server...');
    serverProcess.kill();
    
    console.log('✅ Fast TOMRA Demo completed!');
  }
}

runFastTomraDemo().catch(console.error);