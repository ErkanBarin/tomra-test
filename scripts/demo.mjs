import { chromium } from 'playwright';

async function runTomraDemo() {
  console.log('🚀 STARTING TOMRA DEMO - LAUNCHING VISIBLE BROWSER...');
  
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
  
  // Launch browser with explicit visible settings
  const browser = await chromium.launch({
    headless: false,
    slowMo: 750, // Reduced from 1500ms to 750ms (half speed)
    devtools: false,
    args: ['--start-maximized', '--no-sandbox']
  });
  
  console.log('✅ Browser launched! You should see Chromium window now!');
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Demo 1: Upload Page
    console.log('\n🎬 === DEMO 1: UPLOAD PAGE ===');
    console.log('📄 Navigating to Upload page...');
    await page.goto('http://127.0.0.1:5173/upload.html');
    
    console.log('⏰ LOOK AT BROWSER - Upload page should be visible for 2.5 seconds...');
    await page.waitForTimeout(2500);
    
    console.log('🎯 Finding file input...');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.hover();
    console.log('👆 HOVERING over file input...');
    await page.waitForTimeout(1500);
    
    console.log('👆 CLICKING file input (file dialog should open)...');
    
    // Set up dialog handler before clicking
    page.on('filechooser', async (fileChooser) => {
      console.log('� File dialog opened - dismissing it...');
      await fileChooser.setFiles([]); // Dismiss without selecting files
      console.log('✅ File dialog dismissed cleanly');
    });
    
    await fileInput.click();
    await page.waitForTimeout(1000); // Wait for dialog to be handled
    
    console.log('🎯 Finding upload button...');
    const uploadButton = page.getByTestId('upload-submit-button');
    await uploadButton.hover();
    console.log('👆 HOVERING over upload button...');
    await page.waitForTimeout(1500);
    
    // Demo 2: Training Page
    console.log('\n🎬 === DEMO 2: TRAINING PAGE ===');
    console.log('📄 Navigating to Training page...');
    await page.goto('http://127.0.0.1:5173/training.html');
    
    console.log('⏰ LOOK AT BROWSER - Training page should be visible for 2.5 seconds...');
    await page.waitForTimeout(2500);
    
    console.log('🎯 Looking for training buttons...');
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`📊 Found ${buttonCount} buttons on page`);
    
    if (buttonCount > 0) {
      console.log('👆 HOVERING over first button...');
      await buttons.first().hover();
      await page.waitForTimeout(1000);
      
      console.log('👆 CLICKING first button...');
      await buttons.first().click();
      await page.waitForTimeout(1500);
    }
    
    // Demo 3: Registry Page
    console.log('\n🎬 === DEMO 3: REGISTRY PAGE ===');
    console.log('📄 Navigating to Registry page...');
    await page.goto('http://127.0.0.1:5173/registry.html');
    
    console.log('⏰ LOOK AT BROWSER - Registry page should be visible for 2.5 seconds...');
    await page.waitForTimeout(2500);
    
    console.log('📜 SCROLLING page to show content...');
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(1000);
    
    // Demo 4: Back to Upload for final interactions
    console.log('\n🎬 === DEMO 4: FINAL UPLOAD INTERACTIONS ===');
    console.log('📄 Going back to Upload page...');
    await page.goto('http://127.0.0.1:5173/upload.html');
    await page.waitForTimeout(1500);
    
    console.log('🎯 Testing all upload interface elements...');
    
    // Test file input again - but avoid opening dialog
    const finalFileInput = page.locator('input[type="file"]');
    console.log('👆 Final hover over file input...');
    await finalFileInput.hover();
    await page.waitForTimeout(1000);
    
    // Test upload button
    const finalUploadButton = page.getByTestId('upload-submit-button');
    console.log('👆 Final hover over upload button...');
    await finalUploadButton.hover();
    await page.waitForTimeout(1000);
    
    console.log('\n🎬 === DEMO COMPLETED ===');
    console.log('⏰ Browser will stay open for 2.5 more seconds...');
    await page.waitForTimeout(2500);
    
  } catch (error) {
    console.error('❌ Demo error:', error.message);
  } finally {
    console.log('🔒 Closing browser...');
    await browser.close();
    
    console.log('🛑 Stopping mock server...');
    serverProcess.kill();
    
    console.log('✅ TOMRA Demo completed!');
  }
}

runTomraDemo().catch(console.error);