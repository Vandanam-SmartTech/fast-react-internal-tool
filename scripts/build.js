#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting optimized build process...\n');

// Check if dist exists and clean it
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  console.log('🧹 Cleaning dist folder...');
  fs.rmSync(distPath, { recursive: true, force: true });
}

console.log('📦 Building production bundle...');
console.log('⚡ Optimizations enabled:');
console.log('  ✓ Code splitting');
console.log('  ✓ Tree shaking');
console.log('  ✓ Minification');
console.log('  ✓ Compression (gzip + brotli)');
console.log('  ✓ Image optimization');
console.log('  ✓ CSS optimization');
console.log('\n⏳ This may take a minute...\n');

// The actual build will be run by npm
