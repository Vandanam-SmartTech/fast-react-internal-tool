#!/bin/bash

echo "🚀 Building optimized production bundle..."

# Clean previous build
rm -rf dist

# Build with production optimizations
npm run build

echo "✅ Build complete!"
echo ""
echo "📊 Bundle Analysis:"
echo "-------------------"

# Check if dist folder exists
if [ -d "dist" ]; then
  echo "Total size: $(du -sh dist | cut -f1)"
  echo ""
  echo "JavaScript bundles:"
  find dist/assets/js -name "*.js" -exec ls -lh {} \; | awk '{print $9, $5}'
  echo ""
  echo "CSS bundles:"
  find dist/assets -name "*.css" -exec ls -lh {} \; | awk '{print $9, $5}'
  echo ""
  echo "✨ Optimization tips:"
  echo "1. Run 'npm run preview' to test locally"
  echo "2. Use Chrome Lighthouse for performance audit"
  echo "3. Deploy to production server"
  echo "4. Monitor Core Web Vitals"
fi
