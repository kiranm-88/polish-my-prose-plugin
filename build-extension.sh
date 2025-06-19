
#!/bin/bash
echo "Building extension..."

# Build the app
npx vite build --outDir dist-extension

# Copy extension files
cp public/manifest.json dist-extension/
cp public/content.js dist-extension/

echo "Extension built successfully in dist-extension/"
echo "To test:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked' and select the dist-extension folder"
