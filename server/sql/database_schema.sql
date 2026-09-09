-- ==========================================================
-- منظومة متابعة الكسارات والوقود والشرشور
-- جهاز تنفيذ مشروعات المواصلات
-- Database Schema for MySQL
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `crusher_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `crusher_db`;

-- 1. جدول المستخدمين (Users)
CREATE TABLE IF NOT EXISTS `User` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'user',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول التقارير اليومية (DailyReports)
CREATE TABLE IF NOT EXISTS `DailyReport` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `reportNumber` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `sector` VARCHAR(191) NULL DEFAULT 'القطعة A',
    `reportType` VARCHAR(191) NULL DEFAULT 'تقرير يومي شامل',
    `crusherName` VARCHAR(191) NOT NULL,
    `materialName` VARCHAR(191) NOT NULL,
    `productionAmount` DOUBLE NOT NULL,
    `salesAmount` DOUBLE NOT NULL DEFAULT 0,
    `fileName` VARCHAR(191) NULL,
    `fileType` VARCHAR(191) NULL,
    `fileData` LONGTEXT NULL,
    `imageUrl` LONGTEXT NULL,
    `uploadedBy` VARCHAR(191) NULL DEFAULT 'م. عبدالرحمن',
    `status` VARCHAR(50) NOT NULL DEFAULT 'approved',
    `parsedData` LONGTEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول حالة المعدات اليومية (EquipmentStatus)
CREATE TABLE IF NOT EXISTS `EquipmentStatus` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `date` DATETIME(3) NOT NULL,
    `equipmentName` VARCHAR(191) NOT NULL,
    `equipmentType` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `operatingHours` DOUBLE NOT NULL,
    `imageUrl` LONGTEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. جدول سجلات الوقود (FuelLog)
CREATE TABLE IF NOT EXISTS `FuelLog` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `date` DATETIME(3) NOT NULL,
    `equipmentName` VARCHAR(191) NOT NULL,
    `fuelType` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `cost` DOUBLE NULL,
    `imageUrl` LONGTEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. جدول خطة الغد (TomorrowPlan)
CREATE TABLE IF NOT EXISTS `TomorrowPlan` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `planDate` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'draft',
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `executionRate` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. جدول بنود خطة الغد (TomorrowPlanItem)
CREATE TABLE IF NOT EXISTS `TomorrowPlanItem` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `planId` INT NOT NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `targetCode` VARCHAR(191) NULL,
    `targetName` VARCHAR(191) NOT NULL,
    `sector` VARCHAR(191) NULL DEFAULT 'القطعة A',
    `currentStatus` VARCHAR(191) NULL,
    `plannedDecision` VARCHAR(191) NOT NULL,
    `targetQuantity` DOUBLE NULL,
    `targetUnit` VARCHAR(191) NULL,
    `reason` TEXT NULL,
    `notes` TEXT NULL,
    `actualExecuted` DOUBLE NULL DEFAULT 0,
    `actualStatus` VARCHAR(191) NULL,
    `executionPercentage` DOUBLE NULL DEFAULT 0,
    `varianceReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT `fk_plan_item_plan` FOREIGN KEY (`planId`) REFERENCES `TomorrowPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. جدول الأعطال والمشاكل التشغيلية (Issue)
CREATE TABLE IF NOT EXISTS `Issue` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sector` VARCHAR(191) NULL DEFAULT 'القطعة A',
    `equipmentCode` VARCHAR(191) NULL,
    `equipmentName` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `severity` VARCHAR(50) NOT NULL DEFAULT 'warning',
    `status` VARCHAR(50) NOT NULL DEFAULT 'open',
    `suggestedAction` TEXT NULL,
    `reportId` INT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT `fk_issue_report` FOREIGN KEY (`reportId`) REFERENCES `DailyReport`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. جدول المعدات والآليات (Equipment)
CREATE TABLE IF NOT EXISTS `Equipment` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(191) NOT NULL UNIQUE,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'operational',
    `driver` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `dailyHours` DOUBLE NOT NULL DEFAULT 0,
    `fuelConsumptionRate` DOUBLE NOT NULL DEFAULT 0,
    `imageUrl` LONGTEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. جدول أذونات صرف الوقود (FuelDispatchLog)
CREATE TABLE IF NOT EXISTS `FuelDispatchLog` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ticketNumber` VARCHAR(191) NOT NULL UNIQUE,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `equipmentName` VARCHAR(191) NOT NULL,
    `liters` DOUBLE NOT NULL,
    `driverName` VARCHAR(191) NULL,
    `pumpOperator` VARCHAR(191) NULL,
    `tankSource` VARCHAR(191) NULL,
    `meterBefore` DOUBLE NULL,
    `meterAfter` DOUBLE NULL,
    `imageUrl` LONGTEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. جدول سجلات الكسارات (CrusherLog)
CREATE TABLE IF NOT EXISTS `CrusherLog` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `sector` VARCHAR(191) NOT NULL,
    `dailyProductionTons` DOUBLE NOT NULL,
    `sharshoorTons` DOUBLE NOT NULL,
    `imageUrl` LONGTEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. جدول سجلات الشرشور (SharshoorLog)
CREATE TABLE IF NOT EXISTS `SharshoorLog` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sector` VARCHAR(191) NOT NULL,
    `crusher` VARCHAR(191) NOT NULL,
    `amountTons` DOUBLE NOT NULL,
    `truckCode` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `imageUrl` LONGTEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. جدول التنبيهات والإنذارات (Alert)
CREATE TABLE IF NOT EXISTS `Alert` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `targetSector` VARCHAR(191) NULL,
    `suggestedAction` TEXT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT FALSE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. جدول تقدم أعمال الطريق (RoadProgressLog)
CREATE TABLE IF NOT EXISTS `RoadProgressLog` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sector` VARCHAR(191) NOT NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'بنود أساسية',
    `todayMeters` DOUBLE NOT NULL DEFAULT 0,
    `previousMeters` DOUBLE NOT NULL DEFAULT 0,
    `totalMeters` DOUBLE NOT NULL DEFAULT 0,
    `dailyTarget` DOUBLE NOT NULL DEFAULT 500,
    `varianceMeters` DOUBLE NOT NULL DEFAULT 0,
    `readyLength` DOUBLE NOT NULL DEFAULT 0,
    `startStation` VARCHAR(191) NULL,
    `endStation` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- البيانات الأولية (Seed Data)
-- ==========================================================

-- مستخدم النظام الافتراضي
INSERT IGNORE INTO `User` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'المدير العام', 'admin@agency.gov.ly', 'admin1234', 'admin'),
(2, 'م. عبدالرحمن (مشرف الموقع)', 'abdulrahman@agency.gov.ly', '123456', 'manager');

-- بيانات الكسارات الأولية
INSERT IGNORE INTO `CrusherLog` (`id`, `name`, `sector`, `dailyProductionTons`, `sharshoorTons`, `notes`) VALUES
(1, 'الكسارة الرئيسية - أوباري', 'القطعة A', 850, 480, 'العمل بكفاءة عالية'),
(2, 'الكسارة الشمالية', 'القطعة B', 620, 310, 'عمل مستقر');

-- معدات أولية
INSERT IGNORE INTO `Equipment` (`id`, `code`, `name`, `type`, `category`, `status`, `driver`, `dailyHours`, `fuelConsumptionRate`) VALUES
(1, 'EQ-101', 'لودر CAT 966H', 'لودر', 'معدات ثقيلة', 'operational', 'سالم علي', 7.5, 22.0),
(2, 'EQ-102', 'حفار Komatsu PC300', 'حفار', 'معدات ثقيلة', 'operational', 'محمد صالح', 8.0, 25.0),
(3, 'EQ-103', 'جريدر CAT 140K', 'جريدر', 'معدات تسوية', 'maintenance', 'خالد أحمد', 0.0, 18.0),
(4, 'EQ-104', 'شاحنة مرسيدس Actros', 'شاحنة نقل', 'نقل وثقيل', 'operational', 'يوسف عمر', 6.0, 15.0);

-- عينات تقدم الطريق
INSERT IGNORE INTO `RoadProgressLog` (`id`, `sector`, `itemName`, `category`, `todayMeters`, `previousMeters`, `totalMeters`, `dailyTarget`, `varianceMeters`, `readyLength`) VALUES
(1, 'القطاع (A)', 'طبقة إعادة التدوير (FDR)', 'بنود أساسية', 450, 12500, 12950, 500, -50, 1500),
(2, 'القطاع (A)', 'رش طبقة التشريب (MCO)', 'بنود أساسية', 600, 11000, 11600, 500, 100, 1200),
(3, 'القطاع (A)', 'طبقة الاسفلت المحسن', 'بنود أساسية', 380, 8200, 8580, 400, -20, 900);
