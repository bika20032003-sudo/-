@echo off
chcp 65001 > nul
cd /d "%~dp0"
title منظومة جهاز الإشراف - متابعة الكسارات والوقود ومعدات المشروع

echo ====================================================
echo   جهاز تنفيذ مشروعات المواصلات
echo   منظومة جهاز الإشراف - الكسارات والوقود والمعدات
echo ====================================================
echo.

echo [1/2] جاري تشغيل الخادم الخلفي (Backend API - 5000)...
start "Crusher Backend API" cmd /k "cd server && npm start"

echo [2/2] جاري تشغيل الواجهة الأمامية (Frontend - 3000)...
start "Crusher Frontend" cmd /k "npm run dev"

echo.
echo جاري فتح المتصفح على المنظومة...
timeout /t 4 /nobreak > nul
start http://localhost:3000

echo تم تشغيل جميع الخدمات بنجاح!
