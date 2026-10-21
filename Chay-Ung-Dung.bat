@echo off
title AutoContent Studio - AI Scriptwriter
echo ========================================================
echo        DANG KHOI DONG AUTOCONTENT STUDIO...
echo ========================================================
cd /d "%~dp0"
call npx electron .
if %errorlevel% neq 0 (
    echo.
    echo [LOI] Khong the khoi chay. Dang thu cach khac...
    call npm start
)
pause
