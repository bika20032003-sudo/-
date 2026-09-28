-- =============================================
-- منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم
-- سكريبت إنشاء قاعدة البيانات والجداول
-- =============================================

-- إنشاء قاعدة البيانات
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'BloodBankWMS')
BEGIN
    CREATE DATABASE BloodBankWMS;
END
GO

USE BloodBankWMS;
GO

-- =============================================
-- جدول المستخدمين
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,                    -- المعرف
        FullName NVARCHAR(100) NOT NULL,                      -- الاسم الكامل
        Username NVARCHAR(50) NOT NULL UNIQUE,                -- اسم المستخدم
        PasswordHash NVARCHAR(255) NOT NULL,                  -- كلمة المرور المشفرة
        Role NVARCHAR(20) NOT NULL DEFAULT 'storekeeper',     -- الصلاحية (admin, storekeeper, viewer)
        Email NVARCHAR(100),                                  -- البريد الإلكتروني
        Phone NVARCHAR(20),                                   -- رقم الهاتف
        IsActive BIT NOT NULL DEFAULT 1,                      -- حالة الحساب
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),       -- تاريخ الإنشاء
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),       -- تاريخ التحديث
        LastLogin DATETIME2                                   -- آخر دخول
    );
END
GO

-- =============================================
-- جدول المخازن
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Warehouses')
BEGIN
    CREATE TABLE Warehouses (
        Id INT IDENTITY(1,1) PRIMARY KEY,                    -- المعرف
        Name NVARCHAR(100) NOT NULL,                          -- اسم المخزن
        Code NVARCHAR(20) NOT NULL UNIQUE,                    -- رمز المخزن
        Location NVARCHAR(200),                               -- الموقع
        Type NVARCHAR(50) NOT NULL DEFAULT N'رئيسي',          -- النوع (رئيسي، فرعي)
        ManagerId INT,                                        -- مسؤول المخزن
        Description NVARCHAR(500),                            -- الوصف
        IsActive BIT NOT NULL DEFAULT 1,                      -- حالة المخزن
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),       -- تاريخ الإنشاء
        CONSTRAINT FK_Warehouses_Manager FOREIGN KEY (ManagerId) REFERENCES Users(Id)
    );
END
GO

-- =============================================
-- جدول التصنيفات
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        Id INT IDENTITY(1,1) PRIMARY KEY,                    -- المعرف
        Name NVARCHAR(100) NOT NULL,                          -- اسم التصنيف
        Description NVARCHAR(500),                            -- الوصف
        ParentId INT,                                         -- التصنيف الأب (للتصنيفات الفرعية)
        IsActive BIT NOT NULL DEFAULT 1,                      -- الحالة
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),       -- تاريخ الإنشاء
        CONSTRAINT FK_Categories_Parent FOREIGN KEY (ParentId) REFERENCES Categories(Id)
    );
END
GO

-- =============================================
-- جدول الأصناف
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Items')
BEGIN
    CREATE TABLE Items (
        Id INT IDENTITY(1,1) PRIMARY KEY,                    -- المعرف
        Name NVARCHAR(200) NOT NULL,                          -- اسم الصنف
        Code NVARCHAR(50) NOT NULL UNIQUE,                    -- رمز الصنف
        Manufacturer NVARCHAR(150),                           -- الشركة المصنعة
        Barcode NVARCHAR(50),                                 -- الباركود
        CategoryId INT NOT NULL,                              -- التصنيف
        Unit NVARCHAR(30) NOT NULL,                           -- نوع الوحدة (علبة، صندوق، كيس، زجاجة)
        StorageCondition NVARCHAR(50) NOT NULL DEFAULT N'خارج الثلاجة', -- مكان التخزين (ثلاجة / خارج ثلاجة)
        DetailedLocation NVARCHAR(200),                       -- موقع التخزين بالتفصيل
        MinQuantity INT NOT NULL DEFAULT 0,                   -- الحد الأدنى للمخزون
        MaxQuantity INT NOT NULL DEFAULT 0,                   -- الحد الأقصى للمخزون
        ReorderLevel INT NOT NULL DEFAULT 0,                  -- نقطة إعادة الطلب
        Description NVARCHAR(500),                            -- الوصف
        IsActive BIT NOT NULL DEFAULT 1,                      -- الحالة
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),       -- تاريخ الإنشاء
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),       -- تاريخ التحديث
        CONSTRAINT FK_Items_Category FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
    );
END
GO

-- =============================================
-- جدول رصيد الأصناف في المخازن
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ItemStock')
BEGIN
    CREATE TABLE ItemStock (
        Id INT IDENTITY(1,1) PRIMARY KEY,                    -- المعرف
        ItemId INT NOT NULL,                                  -- الصنف
        WarehouseId INT NOT NULL,                              -- المخزن
        Quantity INT NOT NULL DEFAULT 0,                       -- الكمية
        BatchNumber NVARCHAR(50),                              -- رقم التشغيلة / الوجبة
        ExpiryDate DATE,                                       -- تاريخ الصلاحية
        StorageLocation NVARCHAR(200),                         -- مكان التخزين بالمخزن (مثال: ثلاجة رقم 2 - رف 3)
        UnitPrice DECIMAL(18,2) NOT NULL DEFAULT 0,           -- سعر الوحدة
        LastUpdated DATETIME2 NOT NULL DEFAULT GETDATE(),     -- آخر تحديث
        CONSTRAINT FK_ItemStock_Item FOREIGN KEY (ItemId) REFERENCES Items(Id),
        CONSTRAINT FK_ItemStock_Warehouse FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id),
        CONSTRAINT UQ_ItemStock UNIQUE (ItemId, WarehouseId, BatchNumber)
    );
END
GO

-- =============================================
-- جدول الموردين
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Suppliers')
BEGIN
    CREATE TABLE Suppliers (
        Id INT IDENTITY(1,1) PRIMARY KEY,                    -- المعرف
        Name NVARCHAR(200) NOT NULL,                          -- اسم المورد / الشركة
        ContactPerson NVARCHAR(100),                           -- الشخص المسؤول
        Phone NVARCHAR(20),                                    -- رقم الهاتف
        Email NVARCHAR(100),                                   -- البريد الإلكتروني
        Address NVARCHAR(500),                                 -- العنوان
        TaxNumber NVARCHAR(50),                                -- الرقم الضريبي
        IsActive BIT NOT NULL DEFAULT 1,                      -- الحالة
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),       -- تاريخ الإنشاء
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()        -- تاريخ التحديث
    );
END
GO

-- =============================================
-- جدول حركات المخزون (إذن الاستلام / إذن الصرف / أمر التكليف)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Transactions')
BEGIN
    CREATE TABLE Transactions (
        Id INT IDENTITY(1,1) PRIMARY KEY,                    -- المعرف
        TransactionNumber NVARCHAR(50) NOT NULL UNIQUE,       -- رقم الحركة / رقم إذن الاستلام أو الصرف
        PoNumber NVARCHAR(50),                                 -- رقم أمر الشراء / أمر التكليف
        Type NVARCHAR(20) NOT NULL,                           -- نوع الحركة (inbound=إذن استلام, outbound=إذن صرف, transfer=تحويل)
        Status NVARCHAR(20) NOT NULL DEFAULT 'pending',       -- الحالة (pending=معلق, approved=معتمد, cancelled=ملغي)
        WarehouseId INT NOT NULL,                              -- المخزن الرئيسي للعملية
        DestWarehouseId INT,                                   -- المخزن المستقبل (في حالة التحويل)
        BeneficiaryName NVARCHAR(200),                         -- الجهة المستفيدة (في حالة إذن الصرف)
        SupplierId INT,                                        -- المورد (في حالة إذن الاستلام)
        UserId INT NOT NULL,                                   -- أمين المخزن أو المستخدم
        ApprovedById INT,                                      -- لجنة الاستلام / المعتمد
        CommitteeNotes NVARCHAR(1000),                         -- ملاحظات وتوقيع لجنة الاستلام
        Notes NVARCHAR(1000),                                  -- ملاحظات عامة
        TransactionDate DATETIME2 NOT NULL DEFAULT GETDATE(), -- تاريخ الحركة / تاريخ الاستلام
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),       -- تاريخ الإنشاء
        CONSTRAINT FK_Transactions_Warehouse FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id),
        CONSTRAINT FK_Transactions_DestWarehouse FOREIGN KEY (DestWarehouseId) REFERENCES Warehouses(Id),
        CONSTRAINT FK_Transactions_Supplier FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id),
        CONSTRAINT FK_Transactions_User FOREIGN KEY (UserId) REFERENCES Users(Id),
        CONSTRAINT FK_Transactions_ApprovedBy FOREIGN KEY (ApprovedById) REFERENCES Users(Id)
    );
END
GO

-- =============================================
-- جدول تفاصيل الحركات
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TransactionDetails')
BEGIN
    CREATE TABLE TransactionDetails (
        Id INT IDENTITY(1,1) PRIMARY KEY,                    -- المعرف
        TransactionId INT NOT NULL,                           -- رقم الحركة
        ItemId INT NOT NULL,                                  -- الصنف
        Quantity INT NOT NULL,                                 -- الكمية
        UnitPrice DECIMAL(18,2) NOT NULL DEFAULT 0,           -- سعر الوحدة
        BatchNumber NVARCHAR(50),                              -- رقم الدفعة
        ExpiryDate DATE,                                       -- تاريخ الصلاحية
        Notes NVARCHAR(500),                                   -- ملاحظات
        CONSTRAINT FK_TransactionDetails_Transaction FOREIGN KEY (TransactionId) REFERENCES Transactions(Id),
        CONSTRAINT FK_TransactionDetails_Item FOREIGN KEY (ItemId) REFERENCES Items(Id)
    );
END
GO

-- =============================================
-- جدول سجل المراجعة
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLog')
BEGIN
    CREATE TABLE AuditLog (
        Id INT IDENTITY(1,1) PRIMARY KEY,                    -- المعرف
        Action NVARCHAR(50) NOT NULL,                         -- العملية (INSERT, UPDATE, DELETE)
        TableName NVARCHAR(50) NOT NULL,                      -- اسم الجدول
        RecordId INT,                                          -- معرف السجل
        OldValues NVARCHAR(MAX),                               -- القيم القديمة (JSON)
        NewValues NVARCHAR(MAX),                               -- القيم الجديدة (JSON)
        UserId INT,                                            -- المستخدم
        IpAddress NVARCHAR(50),                                -- عنوان IP
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),       -- تاريخ العملية
        CONSTRAINT FK_AuditLog_User FOREIGN KEY (UserId) REFERENCES Users(Id)
    );
END
GO

-- =============================================
-- إنشاء الفهارس لتحسين الأداء
-- =============================================
CREATE INDEX IX_Items_CategoryId ON Items(CategoryId);
CREATE INDEX IX_Items_Code ON Items(Code);
CREATE INDEX IX_ItemStock_ItemId ON ItemStock(ItemId);
CREATE INDEX IX_ItemStock_WarehouseId ON ItemStock(WarehouseId);
CREATE INDEX IX_ItemStock_ExpiryDate ON ItemStock(ExpiryDate);
CREATE INDEX IX_Transactions_WarehouseId ON Transactions(WarehouseId);
CREATE INDEX IX_Transactions_Type ON Transactions(Type);
CREATE INDEX IX_Transactions_TransactionDate ON Transactions(TransactionDate);
CREATE INDEX IX_TransactionDetails_TransactionId ON TransactionDetails(TransactionId);
CREATE INDEX IX_AuditLog_TableName ON AuditLog(TableName);
CREATE INDEX IX_AuditLog_CreatedAt ON AuditLog(CreatedAt);
GO

PRINT N'تم إنشاء قاعدة البيانات والجداول بنجاح';
GO
