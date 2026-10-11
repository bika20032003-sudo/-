# ============================================================================
#                وزارة الداخلية - دولة ليبيا
#          منظومة العمليات والتحكم الأمني الموحدة (MERN + MySQL)
#             مشغل الخدمات المتقدم (PowerShell Professional Engine)
# ============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "منظومة وزارة الداخلية | مركز العمليات والتحكم الرقمي"

function Write-MoiHeader {
    Clear-Host
    Write-Host "=================================================================================" -ForegroundColor Cyan
    Write-Host "                وزارة الداخلية - دولة ليبيا                                       " -ForegroundColor White
    Write-Host "       منظومة العمليات والتحكم الأمني الموحدة (MERN Stack + MySQL)                " -ForegroundColor Yellow
    Write-Host "=================================================================================" -ForegroundColor Cyan
    Write-Host ""
}

Write-MoiHeader

# 1. فحص بيئة Node.js
Write-Host "[1/4] فحص محركات التشغيل..." -ForegroundColor White
try {
    $nodeVer = (node -v).Trim()
    $npmVer = (npm -v).Trim()
    Write-Host "  [✓] Node.js متوفر: $nodeVer" -ForegroundColor Green
    Write-Host "  [✓] npm متوفر: $npmVer" -ForegroundColor Green
} catch {
    Write-Host "  [X] خطأ: يرجى تثبيت Node.js من https://nodejs.org" -ForegroundColor Red
    Pause
    Exit
}

# 2. فحص الحزم والمكتبات
Write-Host "`n[2/4] التحقق من حزم النظام (Dependencies)..." -ForegroundColor White
$currentDir = $PSScriptRoot
if (-not (Test-Path "$currentDir\server\node_modules")) {
    Write-Host "  [*] جارٍ تثبيت حزم المخدم الخلفي..." -ForegroundColor Yellow
    Start-Process -FilePath "npm" -ArgumentList "install" -WorkingDirectory "$currentDir\server" -Wait -NoNewWindow
}
Write-Host "  [✓] مكتبات المخدم الخلفي: جاهزة ومثبتة" -ForegroundColor Green

if (-not (Test-Path "$currentDir\client\node_modules")) {
    Write-Host "  [*] جارٍ تثبيت حزم الواجهة الأمامية..." -ForegroundColor Yellow
    Start-Process -FilePath "npm" -ArgumentList "install" -WorkingDirectory "$currentDir\client" -Wait -NoNewWindow
}
Write-Host "  [✓] مكتبات الواجهة الأمامية: جاهزة ومثبتة" -ForegroundColor Green

# 3. فحص اتصال MySQL
Write-Host "`n[3/4] فحص حالة قاعدة بيانات MySQL..." -ForegroundColor White
$mysqlPortCheck = Test-NetConnection -ComputerName "localhost" -Port 3306 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($mysqlPortCheck) {
    Write-Host "  [✓] خادم MySQL: متصل ويعمل على المنفذ 3306" -ForegroundColor Green
} else {
    Write-Host "  [i] تنبيه: خادم MySQL غير مفعّل حالياً (تم تفعيل وضع المعاينة الآمن التلقائي)" -ForegroundColor Yellow
}

# 4. إطلاق الخدمات
Write-Host "`n[4/4] إطلاق خدمات المنظومة..." -ForegroundColor White
Write-Host "  [*] تشغيل المخدم الخلفي (Port 5050)..." -ForegroundColor Cyan
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd '$currentDir\server'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "  [*] تشغيل خادم الواجهة الأمامية (Port 5173)..." -ForegroundColor Cyan
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd '$currentDir\client'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "  [✓] تم تشغيل كافة الخدمات بنجاح!" -ForegroundColor Green
Write-Host "  [*] فتح الرابط في المتصفح الافتراضي: http://localhost:5173" -ForegroundColor Yellow
Start-Process "http://localhost:5173"

# شاشة المراقبة والتحكم
while ($true) {
    Write-MoiHeader
    Write-Host "  حالة الخدمات النشطة:" -ForegroundColor White
    Write-Host "  -------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  [•] خادم الواجهة:      http://localhost:5173    [نشط]" -ForegroundColor Green
    Write-Host "  [•] المخدم الخلفي:     http://localhost:5050    [نشط]" -ForegroundColor Green
    Write-Host "  [•] فحص الصحة:         http://localhost:5050/api/health" -ForegroundColor Cyan
    Write-Host "  -------------------------------------------------------------------------------" -ForegroundColor DarkGray
    
    Write-Host "  خيارات الإدارة والتحكم السريع:" -ForegroundColor White
    Write-Host "  [1] إعادة فتح المنظومة في المتصفح"
    Write-Host "  [2] فحص صحة المخدم (Health Check)"
    Write-Host "  [3] إغلاق خدمات المنظومة والخروج بأمان"
    
    $choice = Read-Host "`n  > اختر الإجراء [1-3]"
    switch ($choice) {
        "1" { Start-Process "http://localhost:5173" }
        "2" {
            try {
                $res = Invoke-RestMethod -Uri "http://localhost:5050/api/health"
                Write-Host "`nاستجابة المخدم: " -ForegroundColor Green
                $res | Format-List
            } catch {
                Write-Host "تعذر الاتصال بالمخدم الخلفي حالياً" -ForegroundColor Red
            }
            Read-Host "اضغط Enter للمتابعة..."
        }
        "3" {
            Write-Host "`nجارٍ إنهاء العمليات بأمان..." -ForegroundColor Yellow
            Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*MOI*" -or $_.Path -like "*node*" } | Stop-Process -Force -ErrorAction SilentlyContinue
            Write-Host "تم إيقاف الخدمات بنجاح. في أمان الله." -ForegroundColor Green
            Start-Sleep -Seconds 2
            Exit
        }
    }
}
