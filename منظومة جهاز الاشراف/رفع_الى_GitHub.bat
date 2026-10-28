@echo off
chcp 65001 > nul
title رفع المنظومة إلى GitHub
echo ====================================================
echo   جاري رفع منظومة متابعة الكسارات إلى GitHub...
echo ====================================================
echo.
cd /d "%~dp0"
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ====================================================
    echo   تم الرفع بنجاح إلى المستودع:
    echo   https://github.com/bika20032003-sudo/-
    echo ====================================================
) else (
    echo [تنبيه] حدث خطأ أثناء الرفع، يرجى التأكد من تسجيل الدخول أو إدخال الـ Personal Access Token.
)
echo.
pause
