@echo off
echo ========================================
echo Starting Smart Canteen Backend Server
echo ========================================
echo.

cd backend

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting backend server...
echo.
echo Backend will run on: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

call npm run dev
