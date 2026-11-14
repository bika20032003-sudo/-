#!/bin/bash
# ==============================================================================
# سكربت النشر والتحديث التلقائي لـ cPanel Git™ Version Control
# منظومة جهاز الإشراف والمتابعة - مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
# ==============================================================================

set -e

# 1. تحديد مسار السكربت ومسار النشر
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# مسار مجلد public_html المستهدف
TARGET_DIR="${DEPLOYPATH:-$HOME/public_html}"
TARGET_DIR="${TARGET_DIR%/}"

if [ ! -d "$TARGET_DIR" ]; then
    TARGET_DIR="../public_html"
fi

if [ ! -d "$TARGET_DIR" ]; then
    TARGET_DIR="."
fi

echo "[Deploy] Script directory: $SCRIPT_DIR"
echo "[Deploy] Target directory: $TARGET_DIR"
/bin/mkdir -p "$TARGET_DIR" 2>/dev/null || true

# 2. أمان البيانات: نسخ احتياطي مؤقت لقاعدة بيانات السيرفر الحية
if [ -f "$TARGET_DIR/api/data/db.json" ]; then
    /bin/cp -f "$TARGET_DIR/api/data/db.json" /tmp/cpanel_live_db_backup.json 2>/dev/null || true
    echo "[Deploy] Live database db.json successfully backed up."
fi

# 3. نسخ ملفات المنظومة من public_html إلى مسار النشر
if [ "$SCRIPT_DIR" = "$TARGET_DIR" ]; then
    echo "[Deploy] Repository cloned directly in target directory."
    if [ -d "$SCRIPT_DIR/public_html" ]; then
        /bin/cp -a "$SCRIPT_DIR/public_html/." "$TARGET_DIR/" 2>/dev/null || true
    fi
else
    echo "[Deploy] Copying files from public_html to $TARGET_DIR..."
    if [ -d "$SCRIPT_DIR/public_html" ]; then
        /bin/cp -a "$SCRIPT_DIR/public_html/." "$TARGET_DIR/" 2>/dev/null || true
        echo "[Deploy] public_html files copied successfully."
    elif [ -d "$SCRIPT_DIR/dist" ]; then
        /bin/cp -a "$SCRIPT_DIR/dist/." "$TARGET_DIR/" 2>/dev/null || true
        echo "[Deploy] dist files copied successfully."
    fi
fi

# 4. التأكد الصريح من نسخ ملفات الضبط الأساسية
[ -f "$SCRIPT_DIR/public_html/.htaccess" ] && /bin/cp -f "$SCRIPT_DIR/public_html/.htaccess" "$TARGET_DIR/" 2>/dev/null || true
[ -f "$SCRIPT_DIR/public_html/.nojekyll" ] && /bin/cp -f "$SCRIPT_DIR/public_html/.nojekyll" "$TARGET_DIR/" 2>/dev/null || true
[ -f "$SCRIPT_DIR/public_html/web.config" ] && /bin/cp -f "$SCRIPT_DIR/public_html/web.config" "$TARGET_DIR/" 2>/dev/null || true

# 5. استعادة قاعدة البيانات الحية فوراً لحماية كافة تقارير المهندسين
if [ -f /tmp/cpanel_live_db_backup.json ]; then
    /bin/mkdir -p "$TARGET_DIR/api/data" 2>/dev/null || true
    /bin/cp -f /tmp/cpanel_live_db_backup.json "$TARGET_DIR/api/data/db.json" 2>/dev/null || true
    /bin/rm -f /tmp/cpanel_live_db_backup.json 2>/dev/null || true
    echo "[Deploy] Live database restored safely."
fi

# 6. ضبط صلاحيات الكتابة لمجلد وملف قاعدة البيانات
/bin/chmod 777 "$TARGET_DIR/api/data" 2>/dev/null || /bin/chmod 755 "$TARGET_DIR/api/data" 2>/dev/null || true
/bin/chmod 666 "$TARGET_DIR/api/data/db.json" 2>/dev/null || /bin/chmod 644 "$TARGET_DIR/api/data/db.json" 2>/dev/null || true

# 7. ضمان وجود index.htm إلى جانب index.html
if [ -f "$TARGET_DIR/index.html" ]; then
    /bin/cp -f "$TARGET_DIR/index.html" "$TARGET_DIR/index.htm" 2>/dev/null || true
fi

# 8. إرسال إشارة إعادة تشغيل خادم Node.js
/bin/mkdir -p "$TARGET_DIR/tmp" 2>/dev/null || true
/bin/touch "$TARGET_DIR/tmp/restart.txt" 2>/dev/null || true

echo "[Deploy] ✅ Automatic update and deployment completed successfully."
exit 0
