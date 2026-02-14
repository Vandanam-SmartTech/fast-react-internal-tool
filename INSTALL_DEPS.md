# Optional Dependencies Installation Guide

## Overview
Some optimization features require additional dependencies. Install them for maximum performance benefits.

## Required for Full Optimization

### 1. Image Optimization Plugin
```bash
npm install -D vite-plugin-imagemin
```

**What it does:**
- Automatically optimizes images during build
- Converts to WebP format
- Reduces image file sizes by 30-50%
- Supports JPG, PNG, GIF, SVG

**Configuration:** Already added to `vite.config.ts`

---

### 2. Bundle Visualizer
```bash
npm install -D rollup-plugin-visualizer
```

**What it does:**
- Generates interactive bundle size visualization
- Helps identify large dependencies
- Shows chunk distribution
- Enables `npm run build:analyze` command

**Usage:**
```bash
npm run build:analyze
# Opens stats.html in browser
```

---

### 3. Web Vitals (Optional)
```bash
npm install web-vitals
```

**What it does:**
- Tracks Core Web Vitals metrics
- Monitors real user performance
- Reports CLS, FID, FCP, LCP, TTFB

**Already integrated in:** `src/utils/performance.ts`

---

## Quick Install All

```bash
npm install -D vite-plugin-imagemin rollup-plugin-visualizer
npm install web-vitals
```

---

## Verification

After installation, verify everything works:

```bash
# 1. Clean install
npm install

# 2. Build with optimizations
npm run build

# 3. Check bundle size
npm run build:analyze

# 4. Test production build
npm run preview
```

---

## Troubleshooting

### Issue: vite-plugin-imagemin fails to install
**Solution:** 
```bash
# Use legacy peer deps
npm install -D vite-plugin-imagemin --legacy-peer-deps
```

### Issue: Build fails with imagemin error
**Solution:**
```bash
# Remove from vite.config.ts temporarily
# Comment out viteImagemin plugin
```

### Issue: Bundle analyzer not working
**Solution:**
```bash
# Install globally
npm install -g rollup-plugin-visualizer

# Or use npx
npx rollup-plugin-visualizer
```

---

## Without Optional Dependencies

The app will still work with all optimizations except:
- ❌ Automatic image optimization during build
- ❌ Bundle size visualization
- ❌ Web Vitals tracking

Core optimizations still active:
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Compression
- ✅ Lazy loading
- ✅ Service worker

---

## Recommended Setup

**For Development:**
```bash
npm install -D rollup-plugin-visualizer
```

**For Production:**
```bash
npm install -D vite-plugin-imagemin rollup-plugin-visualizer
npm install web-vitals
```

---

## Next Steps

1. Install dependencies
2. Run `npm run build`
3. Check `dist/` folder size
4. Run Lighthouse audit
5. Verify 90+ performance score

---

**Note:** All optimizations in `vite.config.ts` work without these dependencies, but installing them provides additional benefits.
