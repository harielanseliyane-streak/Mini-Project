@echo off
color 0B
echo ===================================================
echo     InfoHub - Smart Student ^& College Platform
echo ===================================================
echo.
echo Starting Frontend Server...
start "InfoHub Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Once the frontend says "ready", you can open http://localhost:5173 in your browser.
echo.
pause
