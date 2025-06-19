
import { build } from 'vite';
import fs from 'fs';
import path from 'path';

async function buildExtension() {
  console.log('Building extension...');
  
  // Clean the output directory first
  if (fs.existsSync('dist-extension')) {
    fs.rmSync('dist-extension', { recursive: true, force: true });
  }
  
  try {
    // Build the extension with a simpler configuration
    await build({
      build: {
        outDir: 'dist-extension',
        rollupOptions: {
          input: {
            popup: path.resolve('index-extension.html')
          },
          output: {
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]'
          }
        },
        target: 'es2020',
        minify: false, // Disable minification for debugging
        cssCodeSplit: false,
        sourcemap: false
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
    
    console.log('✅ Vite build completed');
    
    // Copy extension files
    const filesToCopy = [
      { src: 'public/manifest.json', dest: 'manifest.json' },
      { src: 'public/content.js', dest: 'content.js' },
      { src: 'public/favicon.ico', dest: 'favicon.ico' }
    ];
    
    for (const file of filesToCopy) {
      const srcPath = file.src;
      const destPath = path.join('dist-extension', file.dest);
      
      if (fs.existsSync(srcPath)) {
        // Ensure directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file.dest}`);
      } else {
        console.warn(`⚠️  Warning: ${srcPath} not found`);
      }
    }
    
    // Rename popup.html to index.html (this is what Vite generates)
    const popupHtmlPath = path.join('dist-extension', 'popup.html');
    const indexHtmlPath = path.join('dist-extension', 'index.html');
    
    if (fs.existsSync(popupHtmlPath)) {
      fs.renameSync(popupHtmlPath, indexHtmlPath);
      console.log('✅ Renamed popup.html to index.html');
    } else {
      console.error('❌ popup.html not found after build');
    }
    
    // List all files in the output directory
    console.log('\n📁 Generated files:');
    const files = fs.readdirSync('dist-extension');
    files.forEach(file => {
      const filePath = path.join('dist-extension', file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        console.log(`   📄 ${file} (${stats.size} bytes)`);
      } else {
        console.log(`   📁 ${file}/`);
      }
    });
    
    // Verify index.html exists and has content
    if (fs.existsSync(indexHtmlPath)) {
      const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
      console.log(`\n✅ index.html created (${indexContent.length} characters)`);
      console.log('📋 First 200 characters:', indexContent.substring(0, 200) + '...');
    } else {
      console.error('❌ CRITICAL: index.html missing after build');
      return;
    }
    
    console.log('\n🎉 Extension built successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Open Chrome and go to chrome://extensions/');
    console.log('2. Enable "Developer mode" (top right toggle)');
    console.log('3. Click "Load unpacked"');
    console.log('4. Select the dist-extension folder');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    throw error;
  }
}

buildExtension().catch(error => {
  console.error('💥 Extension build failed:', error);
  process.exit(1);
});
