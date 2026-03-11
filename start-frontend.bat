@echo off
echo ========================================
echo Starting Smart Canteen Frontend
echo ========================================
echo.

cd frontend

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting frontend server...
echo.
echo Frontend will open at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

call npm start
