
import { build } from 'vite';
import fs from 'fs';
import path from 'path';

async function buildExtension() {
  console.log('Building extension...');
  
  // Clean the output directory first
  if (fs.existsSync('dist-extension')) {
    fs.rmSync('dist-extension', { recursive: true, force: true });
  }
  
  // Build the app with extension-specific configuration
  await build({
    build: {
      outDir: 'dist-extension',
      rollupOptions: {
        input: path.resolve('index-extension.html'),
        output: {
          // Ensure assets use relative paths
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      },
      // Important for extension compatibility
      target: 'es2020',
      cssCodeSplit: false,
      // Inline small assets to avoid path issues
      assetsInlineLimit: 4096
    },
    define: {
      // Ensure we're building for extension environment
      __EXTENSION_BUILD__: true
    }
  });
  
  // Copy extension-specific files
  const extensionFiles = ['manifest.json', 'content.js'];
  
  for (const file of extensionFiles) {
    const srcPath = path.join('public', file);
    const destPath = path.join('dist-extension', file);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${file}`);
    } else {
      console.warn(`Warning: ${file} not found in public folder`);
    }
  }
  
  // Rename the HTML file to index.html (required by manifest)
  const indexExtensionPath = path.join('dist-extension', 'index-extension.html');
  const indexPath = path.join('dist-extension', 'index.html');
  
  if (fs.existsSync(indexExtensionPath)) {
    fs.renameSync(indexExtensionPath, indexPath);
    console.log('Renamed index-extension.html to index.html');
    
    // Verify the file exists and log its size
    const stats = fs.statSync(indexPath);
    console.log(`index.html created successfully (${stats.size} bytes)`);
  } else {
    console.error('ERROR: index-extension.html not found in dist-extension');
    console.log('Available files:', fs.readdirSync('dist-extension'));
  }
  
  // List all generated files for debugging
  console.log('\nGenerated files:');
  function listFiles(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        console.log(`${prefix}📁 ${file}/`);
        listFiles(filePath, prefix + '  ');
      } else {
        console.log(`${prefix}📄 ${file} (${stat.size} bytes)`);
      }
    });
  }
  listFiles('dist-extension');
  
  console.log('\n✅ Extension built successfully in dist-extension/');
  console.log('\nTo test:');
  console.log('1. Open Chrome and go to chrome://extensions/');
  console.log('2. Enable "Developer mode"');
  console.log('3. Click "Load unpacked" and select the dist-extension folder');
}

buildExtension().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
