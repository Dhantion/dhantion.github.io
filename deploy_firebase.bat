@echo off
echo BilStop Firebase Deployment...
echo.

echo 1. Building project for root domain (skipping /bilstop2 base path)...
set SKIP_BASE_PATH=true
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. Deploying to Firebase...
echo Ensure you have initialized firebase with 'npx firebase init' if this is your first time.
call npx firebase deploy
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Deploy failed! 
    echo Common fixes:
    echo  - Run 'npx firebase login' to log in.
    echo  - Run 'npx firebase init' to select your project.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Deployment Complete!
pause
