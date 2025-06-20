
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
    // Build with Vite
    await build({
      configFile: false,
      build: {
        outDir: 'dist-extension',
        rollupOptions: {
          input: 'index-extension.html',
          output: {
            entryFileNames: 'assets/[name].js',
            chunkFileNames: 'assets/[name].js',
            assetFileNames: 'assets/[name].[ext]'
          }
        }
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
    
    console.log('✅ Vite build completed successfully');
    
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
    
    // Ensure the main HTML file is named index.html and fix script path
    const indexPath = path.join('dist-extension', 'index.html');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf8');
      // Fix the script src to point to the correct built file
      content = content.replace(/src="\/src\/extension\.tsx"/, 'src="./assets/extension.js"');
      fs.writeFileSync(indexPath, content);
      console.log('✅ Fixed script path in index.html');
    } else {
      // Look for the built HTML file and rename it
      const files = fs.readdirSync('dist-extension');
      const htmlFiles = files.filter(f => f.endsWith('.html'));
      if (htmlFiles.length > 0) {
        console.log(`🔄 Renaming ${htmlFiles[0]} to index.html`);
        fs.renameSync(
          path.join('dist-extension', htmlFiles[0]),
          indexPath
        );
      }
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
