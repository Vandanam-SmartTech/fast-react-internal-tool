@echo off
echo Building optimized production bundle...
echo.

REM Clean previous build
if exist dist rmdir /s /q dist

REM Build with production optimizations
call npm run build

echo.
echo Build complete!
echo.
echo Run 'npm run preview' to test locally
echo Then run Lighthouse audit in Chrome DevTools
