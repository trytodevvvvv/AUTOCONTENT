@echo off
title AutoContent Studio - Dong Goi File EXE
echo ========================================================
echo       DANG DONG GOI UNG DUNG THANH FILE .EXE...
echo ========================================================
cd /d "%~dp0"
echo.
echo [1/2] Dang tien hanh dong goi ban Portable va Setup vao thu muc "dist"...
call cmd /c npm run build:win
if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  DONG GOI THANH CONG!
    echo  File .exe hoan chinh da duoc tao trong thu muc "dist\"
    echo ========================================================
    explorer dist
) else (
    echo.
    echo [LOI] Co loi xay ra trong qua trinh dong goi. Vui long kiem tra lai.
)
pause
