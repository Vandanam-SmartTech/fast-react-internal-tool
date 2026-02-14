@echo off
echo Cleaning previous build...
if exist dist rmdir /s /q dist

echo Building production bundle...
call npm run build

echo.
echo Build complete! Starting preview server...
echo.
echo Open Chrome and navigate to: http://localhost:4173/solarpro/bdo-dashboard
echo Then run Lighthouse audit (F12 > Lighthouse > Performance)
echo.
call npm run preview
