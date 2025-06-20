
import { build } from 'vite';
import fs from 'fs';

async function buildExtension() {
  console.log('🚀 Building Chrome extension with CRXJS...');
  
  // Clean the output directory first
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('🧹 Cleaned dist directory');
  }
  
  try {
    // Build with Vite using CRXJS plugin
    await build({
      mode: 'extension'
    });
    
    console.log('✅ Extension build completed successfully');
    
    console.log('\n🎉 Extension build complete!');
    console.log('\n📋 Installation steps:');
    console.log('1. Open Chrome → chrome://extensions/');
    console.log('2. Enable "Developer mode"');
    console.log('3. Click "Load unpacked"');
    console.log('4. Select the dist folder');
    console.log('5. Click the extension icon in the toolbar');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    throw error;
  }
}

buildExtension().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
