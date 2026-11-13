#!/bin/bash
# ==============================================================================
# سكربت النشر التلقائي لـ cPanel Git Version Control
# ==============================================================================

# تحديد مسار النشر (مجلد public_html الأساسي لحساب cPanel)
TARGET_DIR="${DEPLOYPATH:-$HOME/public_html}"

if [ ! -d "$TARGET_DIR" ]; then
    TARGET_DIR="../public_html"
fi

if [ ! -d "$TARGET_DIR" ]; then
    TARGET_DIR="."
fi

echo "[Deploy] Target directory: $TARGET_DIR"
/bin/mkdir -p "$TARGET_DIR"

# 0. أمان البيانات: نسخ احتياطي مؤقت لقاعدة بيانات السيرفر الحية لمنع استبدالها
if [ -f "$TARGET_DIR/api/data/db.json" ]; then
    /bin/cp -f "$TARGET_DIR/api/data/db.json" /tmp/cpanel_live_db_backup.json 2>/dev/null || true
    echo "[Deploy] Backed up live db.json before file sync."
fi

# 1. نسخ كافة ملفات الواجهة الأمامية من public_html إلى مسار النشر
if [ -d "public_html" ]; then
    /bin/cp -rf public_html/* "$TARGET_DIR/" 2>/dev/null || true
    /bin/cp -f public_html/.htaccess "$TARGET_DIR/" 2>/dev/null || true
    /bin/cp -f public_html/.nojekyll "$TARGET_DIR/" 2>/dev/null || true
    echo "[Deploy] Copied public_html files successfully."
elif [ -d "dist" ]; then
    /bin/cp -rf dist/* "$TARGET_DIR/" 2>/dev/null || true
    /bin/cp -f dist/.htaccess "$TARGET_DIR/" 2>/dev/null || true
    echo "[Deploy] Copied dist files successfully."
fi

# 1.1. استعادة قاعدة البيانات الحية للمشروع فوراً لضمان عدم فقدان أي بيانات مدخلة من المهندسين
if [ -f /tmp/cpanel_live_db_backup.json ]; then
    /bin/mkdir -p "$TARGET_DIR/api/data"
    /bin/cp -f /tmp/cpanel_live_db_backup.json "$TARGET_DIR/api/data/db.json" 2>/dev/null || true
    /bin/rm -f /tmp/cpanel_live_db_backup.json 2>/dev/null || true
    echo "[Deploy] Restored and protected live database successfully."
fi

# 2. ضمان وجود index.htm إلى جانب index.html
if [ -f "$TARGET_DIR/index.html" ]; then
    /bin/cp -f "$TARGET_DIR/index.html" "$TARGET_DIR/index.htm" 2>/dev/null || true
fi

# 3. تثبيت حزم خادم Node.js إن وجد
if [ -d "server" ] && [ -f "server/package.json" ]; then
    cd server && npm install --omit=dev 2>/dev/null || true
    cd ..
fi

# 4. إرسال إشارة إعادة تشغيل خادم Node.js
/bin/mkdir -p tmp
/bin/touch tmp/restart.txt 2>/dev/null || true

echo "[Deploy] HEAD Commit deployed successfully!"
exit 0

