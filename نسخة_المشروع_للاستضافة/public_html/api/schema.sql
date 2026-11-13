-- ============================================================
-- قاعدة بيانات منظومة متابعة أعمال الطريق والوقود والمعدات
-- جهاز تنفيذ مشروعات المواصلات - مشروع أوباري - غات (360 كم)
-- ============================================================

-- الجدول المركزي الموحد لتخزين ومزامنة بيانات المنظومة بالكامل
CREATE TABLE IF NOT EXISTS `system_data_store` (
  `key_name` VARCHAR(64) NOT NULL,
  `data_value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

