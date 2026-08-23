-- ==============================================================================
-- قاعدة بيانات البوابة الإلكترونية لمشروع طريق أوباري - غات (360 كم)
-- جهاز تنفيذ مشروعات المواصلات - دولة ليبيا 🇱🇾
-- نظام إدارة البيانات: MySQL 8.0+ / MariaDB
-- ترميز الحروف: UTF-8 Unicode (utf8mb4_unicode_ci)
-- ==============================================================================

-- 1. إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS `ubari_ghat_portal` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `ubari_ghat_portal`;

-- تعطيل التحقق من المفاتيح الأجنبية مؤقتاً أثناء التهيئة
SET FOREIGN_KEY_CHECKS = 0;

-- ==============================================================================
-- 2. جدول ملخص المؤشرات العامة للمشروع (project_summary)
-- ==============================================================================
DROP TABLE IF EXISTS `project_summary`;
CREATE TABLE `project_summary` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_title` VARCHAR(255) NOT NULL COMMENT 'عنوان المشروع الرسمي',
    `agency_name` VARCHAR(255) NOT NULL DEFAULT 'جهاز تنفيذ مشروعات المواصلات' COMMENT 'الجهة المالكة والمشرفة',
    `initiative` VARCHAR(150) DEFAULT 'خطة عودة الحياة 🇱🇾' COMMENT 'المبادرة الوطنية التابع لها',
    `total_length_km` DECIMAL(6, 2) NOT NULL DEFAULT 360.00 COMMENT 'الطول الإجمالي للطريق بالكيلومتر',
    `overall_progress` DECIMAL(5, 2) NOT NULL DEFAULT 68.50 COMMENT 'نسبة الإنجاز الفعلي %',
    `planned_progress` DECIMAL(5, 2) NOT NULL DEFAULT 70.00 COMMENT 'نسبة الإنجاز المخطط %',
    `total_budget_lyd` DECIMAL(15, 2) NOT NULL DEFAULT 145000000.00 COMMENT 'الميزانية الكلية المرصودة بالدينار الليبي',
    `spent_budget_lyd` DECIMAL(15, 2) NOT NULL DEFAULT 99325000.00 COMMENT 'المصروف الفعلي حتى تاريخه',
    `active_contractors_count` INT NOT NULL DEFAULT 4 COMMENT 'عدد الشركات الوطنية المنفذة',
    `total_fleet_machinery` INT NOT NULL DEFAULT 142 COMMENT 'إجمالي عدد الآليات الثقيلة المسجلة',
    `total_workforce` INT NOT NULL DEFAULT 428 COMMENT 'إجمالي القوى العاملة الميدانية',
    `asphalt_paved_km` DECIMAL(6, 2) NOT NULL DEFAULT 246.60 COMMENT 'إجمالي المسافة المرصوفة بالأسفلت (كم)',
    `solar_poles_total` INT NOT NULL DEFAULT 1730 COMMENT 'إجمالي أعمدة الإنارة بالطاقة الشمسية المعتمدة',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جدول المؤشرات القيادية الشاملة للمشروع';

-- ==============================================================================
-- 3. جدول الشركات المنفذة (contractors)
-- ==============================================================================
DROP TABLE IF EXISTS `contractors`;
CREATE TABLE `contractors` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) UNIQUE NOT NULL COMMENT 'رمز الشركة CONT-101',
    `name` VARCHAR(255) NOT NULL COMMENT 'اسم شركة المقاولات',
    `assigned_sector` VARCHAR(255) NOT NULL COMMENT 'القطاع المكلفة به',
    `contract_value_lyd` DECIMAL(15, 2) NOT NULL COMMENT 'قيمة العقد التنفيذي بالدينار الليبي',
    `contract_value_formatted` VARCHAR(100) NOT NULL COMMENT 'القيمة منسقة للعرض',
    `completion_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'نسبة الإنجاز %',
    `quality_score` VARCHAR(20) DEFAULT '98%' COMMENT 'معدل الجودة والتقييم الفني',
    `engineer_in_charge` VARCHAR(150) COMMENT 'المهندس المشرف',
    `contact_phone` VARCHAR(50) COMMENT 'هاتف التواصل',
    `status` ENUM('نشط', 'مكتمل', 'متوقف', 'تحت التدقيق') DEFAULT 'نشط',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='سجل شركات المقاولات المنفذة';

-- ==============================================================================
-- 4. جدول قطاعات الطريق الـ 4 (sectors)
-- ==============================================================================
DROP TABLE IF EXISTS `sectors`;
CREATE TABLE `sectors` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sector_code` VARCHAR(50) UNIQUE NOT NULL COMMENT 'رمز القطاع SEC-01',
    `name` VARCHAR(255) NOT NULL COMMENT 'اسم القطاع مثلا: أوباري - الفيوات',
    `length_km` DECIMAL(6, 2) NOT NULL COMMENT 'طول القطاع بالكيلومتر',
    `progress_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'نسبة الإنجاز في القطاع %',
    `contractor_id` INT COMMENT 'المفتاح الأجنبي لشركة المقاولات',
    `contractor_name` VARCHAR(255) NOT NULL COMMENT 'اسم الشركة المنفذة',
    `resident_engineer` VARCHAR(150) NOT NULL COMMENT 'المهندس المقيم',
    `status` VARCHAR(100) NOT NULL DEFAULT 'جار العمل' COMMENT 'حالة التنفيذ الحالية',
    `status_color` VARCHAR(50) DEFAULT 'emerald' COMMENT 'لون الحالة للواجهة',
    `asphalt_thickness_cm` DECIMAL(4, 2) DEFAULT 10.00 COMMENT 'سمك طبقة الأسفلت بالسنتيمتر',
    `solar_poles_installed` INT DEFAULT 0 COMMENT 'أعمدة الإنارة المنجزة',
    `machinery_count` INT DEFAULT 0 COMMENT 'عدد الآليات في هذا القطاع',
    `active_workers` INT DEFAULT 0 COMMENT 'عدد العمال بالقطاع',
    `image_url` VARCHAR(500) DEFAULT '/road-work.jpg' COMMENT 'رابط الصورة الميدانية للقطاع',
    `technical_notes` TEXT COMMENT 'الملاحظات الفنية وتقارير التقدم',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_sector_contractor` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جدول قطاعات ومسارات الطريق الأربعة';

-- ==============================================================================
-- 5. جدول أسطول الآليات والمعدات الثقيلة (machinery_fleet)
-- ==============================================================================
DROP TABLE IF EXISTS `machinery_fleet`;
CREATE TABLE `machinery_fleet` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `contractor_id` INT NOT NULL COMMENT 'الشركة المالكة/المشغلة للآلية',
    `sector_id` INT DEFAULT NULL COMMENT 'القطاع المتواجدة به الآلية حالياً',
    `machinery_type` VARCHAR(255) NOT NULL COMMENT 'نوع الآلية مثلا: فرادة أسفلت Vögele Super 1800',
    `count` INT NOT NULL DEFAULT 1 COMMENT 'العدد',
    `operational_status` VARCHAR(100) NOT NULL DEFAULT 'عمليات رصف' COMMENT 'الحالة التشغيلية',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_machinery_contractor` FOREIGN KEY (`contractor_id`) REFERENCES `contractors` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_machinery_sector` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='سجل الآليات والمعدات الثقيلة بالحقل';

-- ==============================================================================
-- 6. جدول السجل التاريخي لتقدم الإنجاز الشهري (monthly_progress_history)
-- ==============================================================================
DROP TABLE IF EXISTS `monthly_progress_history`;
CREATE TABLE `monthly_progress_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `month_name` VARCHAR(50) NOT NULL COMMENT 'اسم الشهر مثلا: يناير، فبراير',
    `year` INT NOT NULL DEFAULT 2026,
    `order_index` INT NOT NULL COMMENT 'ترتيب الشهر',
    `planned_progress` DECIMAL(5, 2) NOT NULL COMMENT 'المخطط %',
    `actual_progress` DECIMAL(5, 2) NOT NULL COMMENT 'الفعلي %',
    `budget_spent_millions` DECIMAL(6, 2) NOT NULL COMMENT 'المصروف التراكمي بملايين الدينارات',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='البيانات التاريخية للإنجاز المالي والفني للرسوم البيانية';

-- ==============================================================================
-- 7. جدول النقاط والمحطات على الخريطة التفاعلية (map_locations)
-- ==============================================================================
DROP TABLE IF EXISTS `map_locations`;
CREATE TABLE `map_locations` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT 'معرف النقطة مثلا ubari, ghat',
    `title` VARCHAR(255) NOT NULL COMMENT 'اسم المحطة',
    `coords` VARCHAR(100) NOT NULL COMMENT 'الإحداثيات الجغرافية lat,lng',
    `latitude` DECIMAL(10, 6) NOT NULL,
    `longitude` DECIMAL(10, 6) NOT NULL,
    `station_code` VARCHAR(50) NOT NULL COMMENT 'رمز المحطة مثلا 000+00',
    `contractor` VARCHAR(255) NOT NULL COMMENT 'الشركة المسؤولة',
    `progress_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `description` TEXT NOT NULL COMMENT 'وصف النقطة والأعمال',
    `map_embed_url` VARCHAR(500) NOT NULL COMMENT 'رابط التضمين لخريطة Google Maps',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='محطات ونقاط مسار الطريق على الخريطة الجغرافية';

-- ==============================================================================
-- 8. جدول المستخدمين والمهندسين (users)
-- ==============================================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL COMMENT 'الاسم الكامل',
    `email` VARCHAR(150) UNIQUE NOT NULL COMMENT 'البريد الإلكتروني',
    `password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'كلمة المرور المشفرة',
    `role` VARCHAR(100) NOT NULL DEFAULT 'مهندس ميداني' COMMENT 'الصفة الوظيفية',
    `account_type` ENUM('حساب رسمي معتمد', 'حساب إشرافي', 'حساب زائر', 'مدير نظام') DEFAULT 'حساب رسمي معتمد',
    `avatar_url` VARCHAR(500) DEFAULT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='سجل حسابات المستخدمين والمهندسين المشرفين';

-- تفعيل التحقق من المفاتيح الأجنبية
SET FOREIGN_KEY_CHECKS = 1;


-- ==============================================================================
-- بيانات أولية معتمدة (SEED DATA)
-- ==============================================================================

-- 1. إدخال المؤشرات العامة
INSERT INTO `project_summary` (
    `id`, `project_title`, `agency_name`, `initiative`, `total_length_km`, 
    `overall_progress`, `planned_progress`, `total_budget_lyd`, `spent_budget_lyd`, 
    `active_contractors_count`, `total_fleet_machinery`, `total_workforce`, 
    `asphalt_paved_km`, `solar_poles_total`
) VALUES (
    1,
    'مشروع صيانة وتأهيل طريق أوباري - غات',
    'جهاز تنفيذ مشروعات المواصلات',
    'خطة عودة الحياة 🇱🇾',
    360.00,
    68.50,
    70.00,
    145000000.00,
    99325000.00,
    4,
    142,
    428,
    246.60,
    1730
);

-- 2. إدخال الشركات المنفذة
INSERT INTO `contractors` (
    `id`, `code`, `name`, `assigned_sector`, `contract_value_lyd`, 
    `contract_value_formatted`, `completion_rate`, `quality_score`, 
    `engineer_in_charge`, `status`
) VALUES 
(1, 'CONT-101', 'شركة السهل الصحراوي للمقاولات العامة', 'القطاع الأول (أوباري - الفيوات)', 38500000.00, '38,500,000 د.ل', 84.00, '98.5%', 'م. عبد السلام الفزاني', 'نشط'),
(2, 'CONT-102', 'شركة الهضبة لإعادة الإعمار والطرق', 'القطاع الثاني (الفيوات - العوينات)', 42000000.00, '42,000,000 د.ل', 72.00, '96.2%', 'م. طارق المحجوب', 'نشط'),
(3, 'CONT-103', 'شركة الأفق الوطني للإنشاءات الهندسية', 'القطاع الثالث (العوينات - البركت)', 39000000.00, '39,000,000 د.ل', 61.00, '95.8%', 'م. سالم التواتي', 'نشط'),
(4, 'CONT-104', 'شركة الجنوب للمشاريع الكبرى والجسور', 'القطاع الرابع (البركت - غات)', 25500000.00, '25,500,000 د.ل', 55.00, '97.0%', 'م. علي الغاتي', 'نشط');

-- 3. إدخال القطاعات الأربعة
INSERT INTO `sectors` (
    `id`, `sector_code`, `name`, `length_km`, `progress_rate`, `contractor_id`, 
    `contractor_name`, `resident_engineer`, `status`, `status_color`, 
    `asphalt_thickness_cm`, `solar_poles_installed`, `machinery_count`, `active_workers`, 
    `image_url`, `technical_notes`
) VALUES 
(
    1, 'SEC-01', 'القطاع الأول: أوباري - الفيوات', 85.00, 84.00, 1,
    'شركة السهل الصحراوي للمقاولات العامة', 'م. عبد السلام الفزاني', 'متقدم جداً', 'emerald',
    12.00, 640, 38, 115, '/road-work.jpg',
    'تم الانتهاء من الطبقة الرابطة وجاري استكمال الرصف النهائي للطبقة السطحية.'
),
(
    2, 'SEC-02', 'القطاع الثاني: الفيوات - العوينات', 95.00, 72.00, 2,
    'شركة الهضبة لإعادة الإعمار والطرق', 'م. طارق المحجوب', 'وفق الجدول الزمني', 'amber',
    10.00, 480, 42, 130, '/road-paving-official.jpg',
    'أعمال توسعة الأكتاف وبناء قنوات تصريف مياه الأمطار في أودية العوينات.'
),
(
    3, 'SEC-03', 'القطاع الثالث: العوينات - البركت', 100.00, 61.00, 3,
    'شركة الأفق الوطني للإنشاءات الهندسية', 'م. سالم التواتي', 'جار الرصف', 'blue',
    8.00, 320, 36, 98, '/road-work-hero.jpg',
    'كشط الإسفلت المتهالك القديم وإزالة مصدات الرمال وإعادة التأسيس.'
),
(
    4, 'SEC-04', 'القطاع الرابع: البركت - غات (المدخل التاريخي)', 80.00, 55.00, 4,
    'شركة الجنوب للمشاريع الكبرى والجسور', 'م. علي الغاتي', 'تحت التنفيذ المكثف', 'purple',
    7.00, 290, 26, 85, '/road-work.jpg',
    'أعمال مد الطبقة الأساسية بالحجر المكسور بالقرب من قلعة غات التاريخية.'
);

-- 4. إدخال الآليات الثقيلة
INSERT INTO `machinery_fleet` (`contractor_id`, `sector_id`, `machinery_type`, `count`, `operational_status`) VALUES
(1, 1, 'فرادة أسفلت Vögele Super 1800 ألمانية', 4, 'عمليات رصف'),
(1, 1, 'دكّاكات أسفلت Dynapac & CAT', 12, 'عمليات رصف'),
(1, 1, 'شاحنات نقل أسفلت حامي Mercedes Actros', 18, 'نقل مستمر'),
(2, 2, 'جريـدرات كاترپيلار CAT 140K', 6, 'تسوية وتمهيد'),
(2, 2, 'فرادات أسفلت ألمانية', 3, 'رصف'),
(2, 2, 'شاحنات خلط وإرشادات', 20, 'عمليات ميدانية'),
(3, 3, 'كشاطات أسفلت Wirtgen Cold Milling', 3, 'إزالة أسفلت متهالك'),
(3, 3, 'محطة خلط أسفلت مركزية', 1, 'إنتاج 240 طن/ساعة'),
(3, 3, 'دكّاكات وشاحنات', 24, 'شغال'),
(4, 4, 'حفارات ورافعات جسور', 8, 'بناء عبّارات السيول'),
(4, 4, 'فرادة أسفلت ومعدات إنارة', 12, 'تركيب أعمدة شمسية');

-- 5. إدخال التاريخ الشهري للإنجاز
INSERT INTO `monthly_progress_history` (`month_name`, `year`, `order_index`, `planned_progress`, `actual_progress`, `budget_spent_millions`) VALUES
('يناير', 2026, 1, 15.00, 12.00, 18.00),
('فبراير', 2026, 2, 25.00, 23.00, 32.00),
('مارس', 2026, 3, 36.00, 35.00, 48.00),
('أبريل', 2026, 4, 48.00, 46.00, 62.00),
('مايو', 2026, 5, 58.00, 56.00, 74.00),
('يونيو', 2026, 6, 64.00, 63.00, 85.00),
('يوليو', 2026, 7, 70.00, 68.50, 99.30);

-- 6. إدخال مواقع الخريطة
INSERT INTO `map_locations` (`id`, `title`, `coords`, `latitude`, `longitude`, `station_code`, `contractor`, `progress_rate`, `description`, `map_embed_url`) VALUES
('ubari', 'أوباري (نقطة الانطلاق)', '26.5925,12.7803', 26.592500, 12.780300, 'المحطة 000+00', 'شركة أوباري الوطنية للمقاولات', 82.00, 'منطقة انطلاق المشروع والمجمع الإداري الرئيسي لجهاز تنفيذ مشروعات المواصلات.', 'https://maps.google.com/maps?q=Ubari,Libya&t=&z=11&ie=UTF8&iwloc=&output=embed'),
('alfuroos', 'قطاع الفروض - بيسان', '26.2100,12.1500', 26.210000, 12.150000, 'المحطة 085+00', 'شركة الفروض العامة للإنشاءات', 74.00, 'أعمال طبقة الأسفلت الرابطة وإنجاز العبارات الخرسانية الصندوقية.', 'https://maps.google.com/maps?q=Al+Furoos,Libya&t=&z=10&ie=UTF8&iwloc=&output=embed'),
('aluwaynat', 'قطاع العوينات - البركت', '25.3500,10.6800', 25.350000, 10.680000, 'المحطة 215+00', 'ائتلاف شركات الطرق الأفريقية', 65.00, 'إنجاز أعمال التوسعة والفرش والتجهيز لإنارة أعمدة الطاقة الشمسية.', 'https://maps.google.com/maps?q=Al+Uwaynat,Libya&t=&z=10&ie=UTF8&iwloc=&output=embed'),
('ghat', 'مدينة غات (نهاية الطريق 360 كم)', '24.9647,10.1764', 24.964700, 10.176400, 'المحطة 360+00', 'شركة غات الدولية للمقاولات', 58.00, 'المنفذ الحدودي الجنوبي الغربي وتأهيل مداخل المدينة التاريخية.', 'https://maps.google.com/maps?q=Ghat,Libya&t=&z=11&ie=UTF8&iwloc=&output=embed');

-- 7. إدخال حسابات المستخدمين والمهندسين
INSERT INTO `users` (`id`, `name`, `email`, `role`, `account_type`, `avatar_url`) VALUES
(1, 'م. أحمد الشريف', 'eng.ahmed@trans.gov.ly', 'مدير مشروع قطاع أوباري', 'حساب رسمي معتمد', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
(2, 'م. سالم الزوي', 'eng.salem@trans.gov.ly', 'مهندس الإشراف الفني والرقابة', 'حساب إشرافي', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
(3, 'مواطن / متابع المشروع', 'citizen.visitor@gmail.com', 'وضع المتابعة العامة والبلاغات', 'حساب زائر', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80');
