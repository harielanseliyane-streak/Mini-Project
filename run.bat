@echo off
color 0B
echo ===================================================
echo     InfoHub - Smart Student ^& College Platform
echo ===================================================
echo.
echo Starting Backend Server...
start "InfoHub Backend" cmd /k "cd backend && npm run dev"

echo Starting Frontend Server...
start "InfoHub Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting up in separate windows!
echo.
echo [1] Backend API will run on: http://localhost:5000
echo [2] Frontend App will run on: http://localhost:5173
echo.
echo Once the frontend says "ready", you can open http://localhost:5173 in your browser.
echo.
pause
