
import { build } from 'vite';
import fs from 'fs';
import path from 'path';

async function buildExtension() {
  console.log('Building extension...');
  
  // Build the app with extension entry point
  await build({
    build: {
      outDir: 'dist-extension',
      rollupOptions: {
        input: {
          index: path.resolve('index-extension.html')
        },
        output: {
          entryFileNames: 'assets/[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'index-extension.html') {
              return 'index.html';
            }
            return 'assets/[name].[ext]';
          }
        }
      }
    }
  });
  
  // Ensure index.html exists in the output directory
  const indexExtensionPath = path.join('dist-extension', 'index-extension.html');
  const indexPath = path.join('dist-extension', 'index.html');
  
  if (fs.existsSync(indexExtensionPath) && !fs.existsSync(indexPath)) {
    fs.renameSync(indexExtensionPath, indexPath);
    console.log('Renamed index-extension.html to index.html');
  }
  
  // Copy extension files
  const extensionFiles = ['manifest.json', 'content.js'];
  
  for (const file of extensionFiles) {
    const srcPath = path.join('public', file);
    const destPath = path.join('dist-extension', file);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${file}`);
    }
  }
  
  console.log('Extension built successfully in dist-extension/');
  console.log('To test:');
  console.log('1. Open Chrome and go to chrome://extensions/');
  console.log('2. Enable "Developer mode"');
  console.log('3. Click "Load unpacked" and select the dist-extension folder');
}

buildExtension().catch(console.error);
