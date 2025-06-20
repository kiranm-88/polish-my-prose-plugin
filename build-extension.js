
import { build } from 'vite';
import fs from 'fs';
import path from 'path';

async function buildExtension() {
  console.log('🚀 Building Chrome extension...');
  
  // Clean the output directory first
  if (fs.existsSync('dist-extension')) {
    fs.rmSync('dist-extension', { recursive: true, force: true });
    console.log('🧹 Cleaned dist-extension directory');
  }
  
  try {
    // Build with Vite using proper extension configuration
    await build({
      configFile: false,
      root: '.',
      build: {
        outDir: 'dist-extension',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            extension: 'src/extension.tsx'
          },
          output: {
            entryFileNames: 'extension.js',
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]',
            format: 'iife'
          }
        },
        target: 'es2015',
        minify: false
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
    
    console.log('✅ Vite build completed successfully');
    
    // Copy the HTML file
    fs.copyFileSync('index-extension.html', path.join('dist-extension', 'index.html'));
    console.log('✅ Copied index.html');
    
    // Copy extension-specific files
    const extensionFiles = [
      { src: 'public/manifest.json', dest: 'manifest.json' },
      { src: 'public/content.js', dest: 'content.js' }
    ];
    
    for (const file of extensionFiles) {
      if (fs.existsSync(file.src)) {
        fs.copyFileSync(file.src, path.join('dist-extension', file.dest));
        console.log(`✅ Copied ${file.dest}`);
      } else {
        console.warn(`⚠️  ${file.src} not found`);
      }
    }
    
    // Fix the HTML file to point to the correct script
    const indexPath = path.join('dist-extension', 'index.html');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf8');
      content = content.replace(/src=".*?extension\.(tsx|js)"/, 'src="./extension.js"');
      fs.writeFileSync(indexPath, content);
      console.log('✅ Fixed script path in index.html');
    }
    
    console.log('\n🎉 Extension build complete!');
    console.log('\n📋 Installation steps:');
    console.log('1. Open Chrome → chrome://extensions/');
    console.log('2. Enable "Developer mode"');
    console.log('3. Click "Load unpacked"');
    console.log('4. Select the dist-extension folder');
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
