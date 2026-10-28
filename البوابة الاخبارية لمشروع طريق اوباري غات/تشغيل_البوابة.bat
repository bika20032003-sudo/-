@echo off
chcp 65001 > nul
cd /d "%~dp0"
title بوابة مشروع صيانة طريق أوباري - غات 3D
color 0B

echo ========================================================
echo     جهاز تنفيذ مشروعات المواصلات
echo     بوابة مشروع صيانة طريق أوباري - غات (360 كم)
echo ========================================================
echo.

echo [1/2] جاري تشغيل الخادم الخلفي (Backend API - 5000)...
start "Ubari Portal Backend" cmd /k "node server/server.js"

echo [2/2] جاري تشغيل الواجهة الأمامية (Frontend - 3000)...
start "Ubari Portal Frontend" cmd /k "npm run dev"

echo.
echo جاري فتح المتصفح على البوابة...
timeout /t 3 /nobreak > nul
start http://localhost:3000

echo تم تشغيل البوابة بنجاح!
