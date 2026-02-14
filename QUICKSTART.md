# ⚡ Quick Start Guide

## 🚀 Get Running in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development
```bash
npm run dev
```

### 3. Open Browser
```
http://localhost:8080
```

**That's it!** You're ready to develop. 🎉

---

## 📦 Production Build (2 Steps)

### 1. Build
```bash
npm run build
```

### 2. Preview
```bash
npm run preview
```

**Done!** Check `http://localhost:4173`

---

## ✅ Verify Optimizations (3 Steps)

### 1. Build
```bash
npm run build
```

### 2. Check Size
```bash
# Windows
dir dist /s

# Mac/Linux
du -sh dist/
```

### 3. Run Lighthouse
- Open `http://localhost:4173` in Chrome
- Press F12 → Lighthouse tab
- Click "Analyze page load"
- Verify Performance > 90

**Success!** 🎯

---

## 🎯 Common Tasks

### View Bundle Analysis
```bash
npm run build:analyze
```

### Fix Linting Issues
```bash
npm run lint -- --fix
```

### Clean Build
```bash
# Windows
rmdir /s /q node_modules dist
npm install
npm run build

# Mac/Linux
rm -rf node_modules dist
npm install
npm run build
```

---

## 📚 Need More Info?

| Task | Document |
|------|----------|
| **Setup project** | [README.md](./README.md) |
| **Understand optimizations** | [SUMMARY.md](./SUMMARY.md) |
| **Deploy to production** | [CHECKLIST.md](./CHECKLIST.md) |
| **Learn commands** | [COMMANDS.md](./COMMANDS.md) |
| **All documentation** | [INDEX.md](./INDEX.md) |

---

## 🆘 Troubleshooting

### Build Fails?
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use?
```bash
npm run dev -- --port 3000
```

### Slow Performance?
```bash
# Check if production build
npm run build
npm run preview

# Run Lighthouse audit
# Should score 90+
```

---

## ⚡ Pro Tips

1. **Use `npm run build:analyze`** to see bundle size
2. **Run Lighthouse regularly** to track performance
3. **Check `dist/` folder** after build to verify size
4. **Use production build** for accurate testing
5. **Read [OPTIMIZATION.md](./OPTIMIZATION.md)** for deep dive

---

## 🎓 Learning Path

**Day 1:** Get it running
- Install dependencies
- Start dev server
- Make a small change

**Day 2:** Understand structure
- Read [README.md](./README.md)
- Explore file structure
- Check [COMMANDS.md](./COMMANDS.md)

**Day 3:** Learn optimizations
- Read [SUMMARY.md](./SUMMARY.md)
- Run production build
- Analyze bundle

**Day 4:** Master deployment
- Follow [CHECKLIST.md](./CHECKLIST.md)
- Run Lighthouse
- Deploy to staging

---

## ✨ You're Ready!

Start developing with:
```bash
npm run dev
```

Build for production with:
```bash
npm run build
```

Check performance with:
```bash
npm run build:analyze
```

**Happy coding!** 🚀

---

**Questions?** Check [INDEX.md](./INDEX.md) for all documentation.
