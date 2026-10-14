@echo off
chcp 65001 > nul
title روابط المعاينة المباشرة على GitHub Pages
echo ===================================================================
echo     البوابة الإلكترونية الموحدة - دولة ليبيا
echo ===================================================================
echo.
echo  [1] منظومة وزارة الداخلية (مديرية أمن أوباري):
echo      https://bika20032003-sudo.github.io/-/
echo.
echo  [2] مشروع صيانة وتطوير طريق أوباري – غات (الموقع التعريفي):
echo      https://bika20032003-sudo.github.io/-/road/
echo.
echo  [3] البوابة الإلكترونية لمشروع طريق أوباري – غات (البوابة التفاعلية):
echo      https://bika20032003-sudo.github.io/-/portal/
echo.
echo ===================================================================
echo.
echo  جارٍ فتح الروابط في المتصفح تلقائياً...
start https://bika20032003-sudo.github.io/-/
timeout /t 2 > nul
start https://bika20032003-sudo.github.io/-/road/
timeout /t 2 > nul
start https://bika20032003-sudo.github.io/-/portal/
timeout /t 3 > nul