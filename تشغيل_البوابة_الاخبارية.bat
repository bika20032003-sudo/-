@echo off
chcp 65001 > nul
cd /d "%~dp0"
title البوابة الإخبارية لمشروع طريق أوباري - غات

echo ====================================================
echo   جهاز تنفيذ مشروعات المواصلات
echo   البوابة الإخبارية لمشروع طريق أوباري - غات
echo ====================================================
echo.

cd "البوابة الاخبارية لمشروع طريق اوباري غات"
echo [1/2] جاري تشغيل خادم البوابة...
start "Portal Backend" cmd /k "cd server && npm start"

echo [2/2] جاري تشغيل واجهة البوابة...
start "Portal Frontend" cmd /k "npm run dev"

timeout /t 4 /nobreak > nul
start http://localhost:5173
echo تم التشغيل بنجاح!
