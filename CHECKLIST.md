# Lighthouse Optimization Checklist ✅

## Build & Deploy
- [ ] Run `npm run build` to create optimized production build
- [ ] Verify bundle sizes in `dist/` folder
- [ ] Check gzip/brotli compressed files are generated
- [ ] Test production build with `npm run preview`

## Performance Verification
- [ ] Run Lighthouse audit in production mode
- [ ] Check Performance score > 90
- [ ] Verify FCP < 1.5s
- [ ] Verify LCP < 2.5s
- [ ] Verify TTI < 3s
- [ ] Check CLS < 0.1

## Bundle Analysis
- [ ] Run `npm run build:analyze` (after installing visualizer)
- [ ] Verify initial bundle < 500KB
- [ ] Check no chunk > 250KB
- [ ] Verify lazy loading working (multiple chunks)

## Image Optimization
- [ ] Convert JPG/PNG to WebP format
- [ ] Use OptimizedImage component for all images
- [ ] Set appropriate width/height attributes
- [ ] Use lazy loading for below-fold images

## Code Optimization
- [ ] All routes using lazy loading
- [ ] Heavy libraries (Charts, Maps, MUI) lazy loaded
- [ ] No console.log in production build
- [ ] Service worker registered and caching

## Network Optimization
- [ ] Gzip/Brotli compression enabled
- [ ] Static assets cached (check Network tab)
- [ ] DNS prefetch configured
- [ ] Preconnect to external domains

## Quick Fixes
```bash
# Install missing dependencies
npm install -D vite-plugin-imagemin rollup-plugin-visualizer

# Build and analyze
npm run build
npm run build:analyze

# Test production
npm run preview
```

## Common Issues

### Large Bundle Size
- Check for duplicate dependencies
- Ensure tree-shaking is working
- Verify lazy loading implementation

### Slow Load Time
- Enable compression
- Optimize images
- Reduce initial bundle size
- Use CDN for static assets

### Poor CLS Score
- Set image dimensions
- Reserve space for dynamic content
- Avoid layout shifts

## Success Criteria
✅ Performance: 90+
✅ Best Practices: 95+
✅ Accessibility: 95+
✅ SEO: 100
✅ Initial Bundle: < 500KB
✅ FCP: < 1.5s
✅ LCP: < 2.5s
