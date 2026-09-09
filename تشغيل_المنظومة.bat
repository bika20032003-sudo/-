@echo off
chcp 65001 > nul
title منظومة متابعة الكسارات والوقود والشرشور

echo ====================================================
echo   جهاز تنفيذ مشروعات المواصلات
echo   منظومة متابعة الكسارات والوقود والشرشور
echo ====================================================
echo.

echo [1/2] جاري تشغيل الخادم الخلفي (Backend API - 5000)...
start "Crusher Backend API" cmd /k "cd /d "%~dp0server" && npm start"

echo [2/2] جاري تشغيل الواجهة الأمامية (Frontend - 3000)...
start "Crusher Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo جاري فتح المتصفح على المنظومة...
timeout /t 4 /nobreak > nul
start http://localhost:3000

echo تم تشغيل جميع الخدمات بنجاح!
