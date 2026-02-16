# Quick Commands Reference

## Development
```bash
# Start dev server
npm run dev

# Start dev server on specific port
npm run dev -- --port 3000
```

## Production Build
```bash
# Standard build
npm run build

# Build with analysis
npm run build:analyze

# Preview production build
npm run preview
```

## Testing & Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## Optimization Workflow
```bash
# 1. Install optional dependencies (first time only)
npm install -D vite-plugin-imagemin rollup-plugin-visualizer

# 2. Build optimized version
npm run build

# 3. Analyze bundle
npm run build:analyze

# 4. Test production
npm run preview

# 5. Run Lighthouse
# Open http://localhost:4173 in Chrome
# DevTools → Lighthouse → Run audit
```

## Troubleshooting
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Clear dist folder
rm -rf dist

# Full clean build
rm -rf node_modules dist .vite package-lock.json
npm install
npm run build
```

## Performance Checks
```bash
# Check bundle size
npm run build
du -sh dist/

# Check gzip size
npm run build
gzip -c dist/assets/index-*.js | wc -c

# List all chunks
npm run build
ls -lh dist/assets/
```

## Git Workflow
```bash
# Commit optimizations
git add .
git commit -m "feat: implement comprehensive Lighthouse optimizations"
git push

# Create optimization branch
git checkout -b feature/lighthouse-optimization
git add .
git commit -m "feat: add performance optimizations"
git push -u origin feature/lighthouse-optimization
```

## Deployment
```bash
# Build for production
npm run build

# Deploy dist folder to server
# (Use your deployment method)
scp -r dist/* user@server:/var/www/html/

# Or use deployment service
# vercel deploy
# netlify deploy
```

## Monitoring
```bash
# Check production performance
# 1. Deploy to production
# 2. Open production URL
# 3. Run Lighthouse audit
# 4. Check Web Vitals in console
```

## Quick Fixes

### Bundle too large?
```bash
# Analyze what's taking space
npm run build:analyze

# Check for duplicate dependencies
npm ls <package-name>

# Update dependencies
npm update
```

### Slow build?
```bash
# Clear cache
rm -rf node_modules/.vite

# Disable source maps
# In vite.config.ts: sourcemap: false
```

### Images not optimized?
```bash
# Install image optimizer
npm install -D vite-plugin-imagemin

# Convert images to WebP manually
# Use online tools or imagemagick
```

## Environment Setup
```bash
# Development
cp .env.example .env
# Edit .env with your settings

# Production
# Set environment variables on server
export VITE_API_BASE_URL=https://api.production.com
export VITE_ENV_LABEL=Production
```

## Useful Aliases (Optional)
Add to your `.bashrc` or `.zshrc`:
```bash
alias dev="npm run dev"
alias build="npm run build"
alias analyze="npm run build:analyze"
alias preview="npm run preview"
```

---

**Pro Tip:** Bookmark this file for quick reference!
