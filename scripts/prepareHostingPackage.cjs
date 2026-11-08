const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'نسخة_المشروع_للاستضافة');

console.log('[Hosting Package] Preparing hosting release directory at:', outDir);

// 1. Clean or create output directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// 2. Prepare public_html (Frontend production build)
const publicHtmlDir = path.join(outDir, 'public_html');
fs.mkdirSync(publicHtmlDir, { recursive: true });

const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  console.log('[Hosting Package] Building frontend first...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
}

// Copy dist files to public_html
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const rootPublicHtml = path.join(rootDir, 'public_html');
if (fs.existsSync(path.join(rootPublicHtml, 'assets'))) {
  fs.rmSync(path.join(rootPublicHtml, 'assets'), { recursive: true, force: true });
}
copyRecursiveSync(distDir, publicHtmlDir);
copyRecursiveSync(distDir, rootPublicHtml);

// Also copy dist to server/public so if running node server/src/index.js directly it finds it
const serverDest = path.join(outDir, 'server');
fs.mkdirSync(serverDest, { recursive: true });
copyRecursiveSync(distDir, path.join(serverDest, 'public'));

// 3. Add .htaccess for Apache / cPanel / LiteSpeed to public_html
const htaccessContent = `# ==============================================================================
# تكوين خادم أباتشي وسي بانل (cPanel / Apache / LiteSpeed)
# لمنظومة جهاز الإشراف والمتابعة - مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
# ==============================================================================

# 1. تحديد أولوية الملفات الافتراضية لمنع الشاشة البيضاء نهائياً
DirectoryIndex index.html index.htm index.php

# 2. إجبار الخادم على إرسال نوع المحتوى الصحيح (MIME Types) لكافة ملفات النظام
<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType text/javascript .js
  AddType text/css .css
  AddType image/svg+xml .svg
  AddType image/jpeg .jpg .jpeg
  AddType image/png .png
  AddType application/json .json
  AddType font/woff2 .woff2
  AddType font/woff .woff
</IfModule>

# 3. توجيه المسارات لتطبيقات الصفحة الواحدة (SPA Routing)
<IfModule mod_rewrite.c>
  RewriteEngine On

  # 1. توجيه طلبات واجهة البرمجة (API) إلى خادم الباك إند (إذا كان Node.js يعمل على المنفذ 5000)
  # RewriteRule ^api/(.*)$ http://127.0.0.1:5000/api/$1 [P,L]

  # 2. السماح بالوصول المباشر للملفات والمجلدات الحقيقية (CSS, JS, صور, خطوط)
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # 3. توجيه كافة المسارات الأخرى إلى index.html لضمان عمل واجهة التطبيق
  RewriteRule ^ index.html [L]
</IfModule>

# تحسين كفاءة التخزين المؤقت وضغط الملفات لسرعة استجابة فائقة
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
`;
fs.writeFileSync(path.join(publicHtmlDir, '.htaccess'), htaccessContent, 'utf8');
fs.writeFileSync(path.join(rootPublicHtml, '.htaccess'), htaccessContent, 'utf8');

// Copy index.html to index.htm as well to prevent any server mismatch
if (fs.existsSync(path.join(publicHtmlDir, 'index.html'))) {
  fs.copyFileSync(path.join(publicHtmlDir, 'index.html'), path.join(publicHtmlDir, 'index.htm'));
  fs.copyFileSync(path.join(rootPublicHtml, 'index.html'), path.join(rootPublicHtml, 'index.htm'));
  fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, 'index.htm'));
}

// 4. Add web.config for Windows Server / IIS
const webConfigContent = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React SPA Routing" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".webp" mimeType="image/webp" />
    </staticContent>
  </system.webServer>
</configuration>
`;
fs.writeFileSync(path.join(publicHtmlDir, 'web.config'), webConfigContent, 'utf8');
fs.writeFileSync(path.join(rootPublicHtml, 'web.config'), webConfigContent, 'utf8');

// 5. Add .cpanel.yml for cPanel "Deploy HEAD Commit"
const cpanelYmlContent = `---
# ==============================================================================
# تكوين النشر التلقائي المعتمد لـ cPanel Git™ Version Control
# ==============================================================================
deployment:
  tasks:
    - export DEPLOYPATH=$HOME/public_html/
    - /bin/mkdir -p $DEPLOYPATH
    - /bin/cp -rf public_html/* $DEPLOYPATH/ 2>/dev/null || true
    - /bin/cp -f public_html/.htaccess $DEPLOYPATH/ 2>/dev/null || true
    - /bin/cp -f public_html/index.html $DEPLOYPATH/index.htm 2>/dev/null || true
    - /bin/bash cpanel_deploy.sh 2>/dev/null || true
`;
fs.writeFileSync(path.join(outDir, '.cpanel.yml'), cpanelYmlContent, 'utf8');
fs.writeFileSync(path.join(rootDir, '.cpanel.yml'), cpanelYmlContent, 'utf8');

// 6. Add Webhook deploy script (PHP) for automated GitHub Push deployment
const deployPhpContent = `<?php
/**
 * Auto-Deployment Webhook Script for cPanel Git Version Control
 * سكربت التحديث التلقائي الفوري عند إرسال أي Commit على GitHub
 */
header('Content-Type: application/json; charset=utf-8');

// مفتاح حماية سري لمنع الاستدعاء غير المصرح به
$secret_key = 'supervision_deploy_secret'; 

$provided_key = $_GET['key'] ?? ($_SERVER['HTTP_X_DEPLOY_KEY'] ?? '');
if ($secret_key !== '' && $provided_key !== $secret_key) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Invalid deploy key']);
    exit;
}

$output = [];
$return_var = 0;

// سحب التحديثات من مستودع Git الرئيسي
exec('git pull origin main 2>&1', $output, $return_var);

// تشغيل أمر النشر الخاص بـ cPanel
if (file_exists('.cpanel.yml') || file_exists('../.cpanel.yml')) {
    exec('/usr/local/cpanel/bin/git-check 2>&1', $output);
}

// إعادة تشغيل تطبيق Node.js إن وجد
if (file_exists('tmp/restart.txt')) {
    touch('tmp/restart.txt');
} elseif (file_exists('../tmp/restart.txt')) {
    touch('../tmp/restart.txt');
}

echo json_encode([
    'success' => $return_var === 0,
    'message' => 'HEAD Commit Deployed Successfully',
    'output' => $output,
    'timestamp' => date('Y-m-d H:i:s')
]);
`;
fs.writeFileSync(path.join(publicHtmlDir, 'cpanel_deploy.php'), deployPhpContent, 'utf8');
fs.writeFileSync(path.join(rootPublicHtml, 'cpanel_deploy.php'), deployPhpContent, 'utf8');

// 7. Copy backend server source files
const srcServerDir = path.join(rootDir, 'server');
const serverItems = fs.readdirSync(srcServerDir);
serverItems.forEach(item => {
  if (item === 'node_modules') return; // exclude heavy node_modules
  copyRecursiveSync(path.join(srcServerDir, item), path.join(serverDest, item));
});

// Ensure server/.env exists and is configured for production
const serverEnvContent = `PORT=5000
NODE_ENV=production
# إعدادات قاعدة البيانات (اختياري - في حال عدم توفر MySQL يعمل السيرفر تلقائياً بأقصى سرعة عبر التخزين المستمر data/db.json)
DATABASE_URL="mysql://root:@localhost:3306/crusher_db"
`;
fs.writeFileSync(path.join(serverDest, '.env'), serverEnvContent, 'utf8');

// 8. Root package.json for one-click hosting startup
const rootPkg = {
  name: "crusher-supervision-system-hosting",
  version: "2.0.0",
  description: "نسخة الاستضافة المعتمدة لمنظومة جهاز الإشراف والمتابعة - طريق أوباري غات (360 كم)",
  main: "server/src/index.js",
  type: "module",
  scripts: {
    "start": "node server/src/index.js",
    "install:all": "cd server && npm install",
    "pm2:start": "pm2 start ecosystem.config.cjs",
    "pm2:restart": "pm2 restart ecosystem.config.cjs",
    "pm2:stop": "pm2 stop ecosystem.config.cjs"
  },
  dependencies: {
    "express": "^5.2.1",
    "cors": "^2.8.6",
    "helmet": "^8.3.0",
    "dotenv": "^17.4.2",
    "mysql2": "^3.12.0"
  }
};
fs.writeFileSync(path.join(outDir, 'package.json'), JSON.stringify(rootPkg, null, 2), 'utf8');

// 9. ecosystem.config.cjs for PM2
const pm2Content = `module.exports = {
  apps: [
    {
      name: 'supervision-system-api',
      script: 'server/src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000
      }
    }
  ]
};
`;
fs.writeFileSync(path.join(outDir, 'ecosystem.config.cjs'), pm2Content, 'utf8');

// 10. Dockerfile
const dockerfileContent = `# ==============================================================================
# Dockerfile لمنظومة جهاز الإشراف والمتابعة
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# نسخ تعريفات الحزم وتثبيتها
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# نسخ كود الخادم والواجهة الأمامية الجاهزة
COPY server ./server
COPY public_html ./public_html

ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "server/src/index.js"]
`;
fs.writeFileSync(path.join(outDir, 'Dockerfile'), dockerfileContent, 'utf8');

// 11. docker-compose.yml
const dockerComposeContent = `version: '3.8'

services:
  supervision-app:
    build: .
    container_name: supervision_portal
    restart: always
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
    volumes:
      - ./server/data:/app/server/data
`;
fs.writeFileSync(path.join(outDir, 'docker-compose.yml'), dockerComposeContent, 'utf8');

// 12. Startup scripts (Windows & Linux)
const batContent = `@echo off
chcp 65001 > nul
echo ============================================================================
echo   تشغيل منظومة جهاز الإشراف والمتابعة - نسخة الاستضافة والخادم الموحد
echo ============================================================================
echo.
cd server
if not exist node_modules (
  echo [1/2] جاري تثبيت حزم الخادم...
  call npm install
)
echo [2/2] جاري إطلاق خادم المنظومة المتكامل على المنفذ 5000...
echo.
echo رابط الدخول للمنظومة: http://localhost:5000
echo.
call node src/index.js
pause
`;
fs.writeFileSync(path.join(outDir, 'تشغيل_الخادم_محليا.bat'), batContent, 'utf8');

const shContent = `#!/bin/bash
echo "============================================================================"
echo "  إطلاق منظومة جهاز الإشراف والمتابعة - خادم الإنتاج والاستضافة"
echo "============================================================================"
cd server
if [ ! -d "node_modules" ]; then
  echo "جاري تثبيت الحزم المطلوبة..."
  npm install
fi
echo "تشغيل الخادم على المنفذ 5000..."
node src/index.js
`;
fs.writeFileSync(path.join(outDir, 'start_server.sh'), shContent, 'utf8');

// 13. Comprehensive Documentation Guide in Arabic
const guideContent = `# دليل تشغيل ورفع نسخة المشروع على الاستضافة (Hosting Deployment Guide)
### منظومة جهاز الإشراف والمتابعة - مشروع صيانة وتطوير طريق أوباري - غات (360 كم)

تم إعداد هذه الحزمة خصيصاً لتكون جاهزة للتشغيل والنشر على أي نوع من الاستضافات (مشتركة، سحابية، سيرفرات خاصة VPS، أو شبكة داخلية).

---

## ⚡ تفعيل خيار Deploy HEAD Commit في cPanel:
إذا كنت تستخدم أداة **cPanel Git™ Version Control**، فقد تم إضافة ملف **\`.cpanel.yml\`** في جذر المشروع وهو المسؤول رسمياً عن تفعيل وظيفة **Deploy HEAD Commit**:
1. ادخل إلى لوحة التحكم **cPanel** > قسم **Files** > اختر **Git™ Version Control**.
2. اختر المستودع الخاص بك واضغط على زر **Manage**.
3. انتقل إلى تبويب **Deploy** في الأعلى.
4. ستجد زر **Deploy HEAD Commit** أصبح مفعلاً وجاهزاً؛ بمجرد الضغط عليه:
   * سيتم تلقائياً نسخ أحدث ملفات الواجهة الأمامية إلى مجلد \`public_html\`.
   * سيتم تطبيق إعدادات الـ \`.htaccess\` لضمان عمل كافة الروابط بدون 404.
   * سيتم إعادة تشغيل تطبيق Node.js في السيرفر تلقائياً إن وجد.

> **ملاحظة هامة:** في ملف \`.cpanel.yml\` تم تعيين المسار افتراضياً على:
> \`export DEPLOYPATH=/home/$(whoami)/public_html/\`  
> إذا كان اسم حسابك في الاستضافة مثلاً \`myuser\` يمكنك فتح ملف \`.cpanel.yml\` وتعديله إلى \`/home/myuser/public_html/\`.

---

## 🔄 التحديث التلقائي الفوري عبر Webhook (بدون دخول cPanel):
تم تزويد الحزمة بملف **\`public_html/cpanel_deploy.php\`**؛ يمكنك ربطه بـ **GitHub Webhooks**:
1. في مستودع GitHub ادخل إلى **Settings** > **Webhooks** > **Add webhook**.
2. في **Payload URL** اكتب:
   \`\`\`
   https://your-domain.com/cpanel_deploy.php?key=supervision_deploy_secret
   \`\`\`
3. اختر **Content type**: \`application/json\`.
4. عند كل \`git push\` أو تعديل، سيقوم GitHub بإشعار استضافتك وسحب التحديث ونشره تلقائياً فوراً!

---

## محتويات حزمة الاستضافة:
1. **\`.cpanel.yml\`**: ملف تكوين النشر التلقائي وخيار Deploy HEAD Commit لـ cPanel.
2. **\`public_html/\`**: مجلد الواجهة الأمامية للمنظومة المترجمة والمبنية بأحدث التقنيات مع ملفات \`.htaccess\` لـ cPanel/Apache و \`web.config\` لـ IIS وسكربت \`cpanel_deploy.php\`.
3. **\`server/\`**: خادم الباك إند المتكامل المبني بـ Express.js، ومزود بقاعدة بيانات هجينة فائقة السرعة مع إمكانية الربط بـ MySQL.
4. **\`ecosystem.config.cjs\`**: إعدادات التشغيل التلقائي وإدارة العمليات عبر **PM2** للسيرفرات السحابية.
5. **\`Dockerfile\` & \`docker-compose.yml\`**: للتشغيل المباشر عبر الحاويات (Docker) في السيرفرات أو المنصات الحديثة (Render / Railway / DigitalOcean).
6. **\`تشغيل_الخادم_محليا.bat\` / \`start_server.sh\`**: إطلاق المنظومة بالكامل بنقرة زر واحدة.

---

## 🚀 طرق الرفع والتشغيل بحسب نوع الاستضافة:

### الطريقة الأولى: استضافة cPanel (الخيار الأكثر شيوعاً)

#### أ) إذا كان لديك Node.js مدعوم في cPanel (Node.js Selector):
1. قم برفع ملف **\`نسخة_الاستضافة_المتكاملة.zip\`** عبر **File Manager** إلى الاستضافة واضغط **Extract**.
2. ادخل إلى **Setup Node.js App** في cPanel:
   - **Node.js version**: اختر 18 أو 20 أو أحدث.
   - **Application mode**: اختر \`Production\`.
   - **Application root**: اكتب اسم المجلد الذي رفعت فيه ملفات السيرفر.
   - **Application startup file**: اكتب \`server/src/index.js\`.
3. اضغط **Create** ثم اضغط **Run NPM Install**.
4. اضغط **Restart** وستعمل المنظومة مباشرة بكامل ميزاتها على رابط موقعك!

#### ب) إذا كانت الاستضافة عادية بدون Node.js (واجهة ويب ثابتة فقط):
1. افتح مجلد **\`public_html/\`**.
2. ارفع كافة الملفات الموجودة بداخله مباشرة إلى مجلد \`public_html\` على الاستضافة لديك عبر File Manager أو FTP.
3. المنظومة مزودة بتقنية **Offline/Local Resilience**؛ حيث ستعمل كافة أقسامها، ولوحات التحكم، وإدخال التقارير، والطباعة الرسمية، وحسابات الإكسل مباشرة وبأعلى سرعة من متصفحك!

---

### الطريقة الثانية: سيرفر سحابي أو افتراضي (VPS / Cloud Server / Ubuntu)
1. انسخ محتويات هذا المجلد إلى السيرفر في أي مسار (مثلاً: \`/var/www/supervision-system\`).
2. داخل السيرفر نفّذ الأوامر التالية:
   \`\`\`bash
   cd /var/www/supervision-system/server
   npm install
   \`\`\`
3. تشغيل النظام في الخلفية دائماً عبر PM2 مع إعادة التشغيل التلقائي:
   \`\`\`bash
   npm install -g pm2
   cd /var/www/supervision-system
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   \`\`\`

---

### الطريقة الثالثة: التشغيل عبر Docker
إذا كان لديك Docker مثبت على الخادم:
\`\`\`bash
docker-compose up -d --build
\`\`\`
سيتم بناء المنظومة وتشغيلها فوراً على المنفذ \`5000\`.

---

### الطريقة الرابعة: تشغيل المنظومة على سيرفر محلي أو شبكة داخلية (Intranet)
* في بيئة ويندوز: انقر مرتين على ملف **\`تشغيل_الخادم_محليا.bat\`**.
* سيعمل السيرفر مباشرة، ويمكن لأي جهاز متصل بالشبكة المحلية الدخول عبر:
  \`http://[IP_ADDRESS]:5000\`

---

## 🗄️ إعدادات قاعدة البيانات (Database):
* النظام يعمل افتراضياً عبر نظام **قاعدة البيانات الهجينة الذكية** (\`server/data/db.json\`) والذي يحفظ كل تقرير وكل معاملة لحظياً على القرص مع نسخ احتياطية تلقائية متجددة دون الحاجة لأي تكوين خارجي.
* إذا رغبت بربطه بقاعدة بيانات **MySQL** رسمية على الاستضافة:
  1. افتح ملف \`server/.env\`.
  2. عدّل السطر:
     \`\`\`env
     DATABASE_URL="mysql://اسم_المستخدم:كلمة_المرور@localhost:3306/اسم_قاعدة_البيانات"
     \`\`\`
  3. سيقوم السيرفر بالاتصال بـ MySQL تلقائياً بمجرد توفر البيانات.

---
**تم إعداد هذه النسخة بنجاح وهي جاهزة 100% للاستخدام والرفع.**
`;
fs.writeFileSync(path.join(outDir, 'دليل_الرفع_والتشغيل_على_الاستضافة.md'), guideContent, 'utf8');

// 14. Generate zip archives automatically
console.log('[Hosting Package] Compressing into: نسخة_الاستضافة_المتكاملة.zip...');
try {
  execSync('powershell -Command "Compress-Archive -Path \'نسخة_المشروع_للاستضافة\\*\' -DestinationPath \'نسخة_الاستضافة_المتكاملة.zip\' -Force"', { cwd: rootDir });
  console.log('[Hosting Package] ✅ Full hosting zip archive created successfully!');
} catch (zipErr) {
  console.warn('[Hosting Package] Zip command warning:', zipErr.message);
}

console.log('[Hosting Package] Compressing frontend only into: ملفات_الرفع_المباشر_public_html.zip...');
try {
  execSync('powershell -Command "Compress-Archive -Path \'نسخة_المشروع_للاستضافة\\public_html\\*\' -DestinationPath \'ملفات_الرفع_المباشر_public_html.zip\' -Force"', { cwd: rootDir });
  console.log('[Hosting Package] ✅ Frontend direct zip created successfully!');
} catch (zipErr2) {
  console.warn('[Hosting Package] Direct zip command warning:', zipErr2.message);
}

console.log('[Hosting Package] ✅ All hosting assets prepared successfully at:', outDir);
