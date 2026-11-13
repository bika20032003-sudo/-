<?php
/**
 * إعدادات الاتصال بقاعدة بيانات MySQL الموحدة
 * جهاز تنفيذ مشروعات المواصلات - مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
 * 
 * لربط المنظومة بقاعدة بيانات MySQL في الاستضافة (cPanel):
 * 1. اضبط قيمة MYSQL_ENABLED إلى true.
 * 2. أدخل بيانات قاعدة البيانات التي أنشأتها في cPanel (MySQL Databases).
 * 3. ستقوم المنظومة آلياً بإنشاء الجداول وحفظ كافة التقارير والمراسلات في MySQL.
 * 
 * في حال ترك MYSQL_ENABLED كـ false، ستعمل المنظومة عبر قاعدة البيانات السحابية المركزية المرفقة (db.json).
 */

define('MYSQL_ENABLED', false); // غيّر إلى true عند إدخال بيانات MySQL أدناه

define('MYSQL_HOST', 'localhost');
define('MYSQL_PORT', 3306);
define('MYSQL_DB', 'cpanel_monitoring_db');     // اسم قاعدة البيانات
define('MYSQL_USER', 'cpanel_db_user');         // اسم مستخدم قاعدة البيانات
define('MYSQL_PASS', 'cpanel_db_password');     // كلمة مرور قاعدة البيانات

