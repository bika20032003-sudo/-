-- ============================================================
-- قاعدة بيانات منظومة متابعة أعمال الطريق والوقود والمعدات
-- جهاز تنفيذ مشروعات المواصلات - مشروع أوباري - غات (360 كم)
-- ============================================================

CREATE TABLE IF NOT EXISTS `system_data_store` (
  `key_name` VARCHAR(64) NOT NULL,
  `data_value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reports` (
  `id` VARCHAR(128) NOT NULL,
  `report_number` VARCHAR(128) DEFAULT NULL,
  `report_type` VARCHAR(128) DEFAULT NULL,
  `sector` VARCHAR(128) DEFAULT NULL,
  `status` VARCHAR(64) DEFAULT 'approved',
  `author` VARCHAR(128) DEFAULT NULL,
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_report_number` (`report_number`),
  KEY `idx_report_type` (`report_type`),
  KEY `idx_sector` (`sector`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `messages` (
  `id` VARCHAR(128) NOT NULL,
  `from_username` VARCHAR(64) NOT NULL,
  `to_username` VARCHAR(64) NOT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_from_username` (`from_username`),
  KEY `idx_to_username` (`to_username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
