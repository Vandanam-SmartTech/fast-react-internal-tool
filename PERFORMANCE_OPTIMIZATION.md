# Performance Optimization Guide

Based on Lighthouse Treemap analysis, here are critical optimizations needed:

## 🚨 Critical Issues Found

### Bundle Size Analysis
- **Total Size:** 5.3 MiB
- **Unused Code:** 2.4 MiB (45% waste!)
- **Main Culprits:**
  - react-icons/fa: 1.3 MiB (1.4 MiB unused)
  - lucide-react: 1.0 MiB (358 KiB unused)
  - react-router-dom: 446 KiB (411 KiB unused)

## ✅ Immediate Actions Required

### 1. Fix Icon Imports (CRITICAL - Saves ~1.5 MiB)

**Problem:** You're importing entire icon libraries instead of individual icons.

**Current (BAD):**
```typescript
import * as FaIcons from 'react-icons/fa';
import * as LucideIcons from 'lucide-react';
```

**Fixed (GOOD):**
```typescript
// Import only what you need
import { FaUser, FaHome, FaCog } from 'react-icons/fa';
import { User, Home, Settings } from 'lucide-react';
```

**Action Items:**
1. Search for `import * as` in your codebase
2. Replace with specific named imports
3. Remove unused icons

**Files to check:**
- `src/components/Sidebar.tsx` (40 KiB - likely has icon imports)
- `src/components/Header.tsx` (110 KiB - likely has icon imports)
- Any component using icons

### 2. Implement Code Splitting with React.lazy()

**Add lazy loading for routes:**

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const BDODashboard = lazy(() => import('./pages/Dashboard/BDODashboard'));
const Login = lazy(() => import('./pages/Auth/Login'));
const CustomerManagement = lazy(() => import('./pages/Customers/CustomerManagement'));

// In your routes
<Suspense fallback={<SkeletonLoader />}>
  <Routes>
    <Route path="/dashboard" element={<BDODashboard />} />
    <Route path="/login" element={<Login />} />
    {/* ... other routes */}
  </Routes>
</Suspense>
```

### 3. Optimize React Router (Saves ~400 KiB)

**Current issue:** 411 KiB unused code in react-router-dom

**Solution:** Ensure you're using tree-shakeable imports:

```typescript
// Good
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Bad - don't do this
import * as ReactRouter from 'react-router-dom';
```

### 4. Remove Unused Dependencies

Check if you're actually using these libraries:
- `@mui/material` (excluded but might be imported)
- `recharts` (excluded but might be imported)
- `leaflet` (excluded but might be imported)

**Run this command to check:**
```bash
npx depcheck
```

### 5. Optimize Lucide Icons

**Create a custom icon barrel file:**

```typescript
// src/components/ui/icons.ts
export {
  User,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  // Add only icons you actually use
} from 'lucide-react';
```

**Then import from your barrel:**
```typescript
import { User, Home, Settings } from '@/components/ui/icons';
```

### 6. Enable Tree Shaking for CSS

**Update your CSS imports:**

```typescript
// Instead of importing entire Tailwind
// Make sure your tailwind.config.js has proper purge settings

// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ... rest of config
}
```

### 7. Analyze and Fix Large Components

**Large components found:**
- `src/components/Header.tsx` - 110 KiB
- `src/App.tsx` - 111 KiB
- `src/services/customerRequisitionService.ts` - 77 KiB
- `src/components/Sidebar.tsx` - 69 KiB

**Actions:**
1. Split large components into smaller ones
2. Move service logic to separate files
3. Use React.memo() for expensive components

### 8. Implement Dynamic Imports for Heavy Libraries

```typescript
// For react-easy-crop (48 KiB)
const ImageCropper = lazy(() => import('./components/ImageCropper'));

// For sockjs-client (125 KiB)
const loadWebSocket = () => import('./services/websocket');

// Use only when needed
const initWebSocket = async () => {
  const { default: WebSocketService } = await loadWebSocket();
  return new WebSocketService();
};
```

## 📊 Expected Results After Optimization

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Total Bundle | 5.3 MiB | ~2.5 MiB | 53% |
| Initial Load | 5.3 MiB | ~800 KiB | 85% |
| Unused Code | 2.4 MiB | ~200 KiB | 92% |

## 🔍 Verification Steps

1. **Run Lighthouse again:**
```bash
npm run build
npm run preview
# Then run Lighthouse in Chrome DevTools
```

2. **Check bundle size:**
```bash
npm run build
# Check dist/assets folder sizes
```

3. **Analyze with Bundle Analyzer:**
```bash
npm install -D rollup-plugin-visualizer
```

Add to vite.config.ts:
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, gzipSize: true })
  ],
  // ... rest of config
});
```

## 🎯 Priority Order

1. **HIGH PRIORITY** (Do First):
   - Fix icon imports (saves 1.5 MiB)
   - Add lazy loading for routes (saves 2+ MiB on initial load)
   - Remove unused dependencies

2. **MEDIUM PRIORITY** (Do Next):
   - Split large components
   - Optimize React Router imports
   - Add dynamic imports for heavy libraries

3. **LOW PRIORITY** (Nice to Have):
   - Further code splitting
   - Component memoization
   - CSS optimization

## 📝 Quick Wins Checklist

- [ ] Replace `import *` with named imports for icons
- [ ] Add React.lazy() for all route components
- [ ] Run `npx depcheck` and remove unused deps
- [ ] Create icon barrel file
- [ ] Split Header.tsx and Sidebar.tsx into smaller components
- [ ] Add Suspense boundaries with loading states
- [ ] Enable source maps only for development
- [ ] Test bundle size after each change

## 🚀 Deployment Checklist

Before deploying:
- [ ] Run production build
- [ ] Check bundle sizes in dist/assets
- [ ] Run Lighthouse audit
- [ ] Test all lazy-loaded routes
- [ ] Verify no console errors
- [ ] Check network tab for chunk loading

## 📚 Additional Resources

- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Tree Shaking Guide](https://webpack.js.org/guides/tree-shaking/)
