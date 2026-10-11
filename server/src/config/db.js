import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

let pool = null;
let isMySqlConnected = false;

// In-memory / Mock fallback users if MySQL service is not yet started by user
const memoryUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@moi.gov.ly',
    password_hash: bcrypt.hashSync('admin', 10),
    full_name: 'سيادة العميد / أحمد المهدوي',
    badge_number: 'MOI-10492',
    rank_title: 'عميد شرطة / رئيس مركز العمليات والتحكم',
    department: 'غرفة العمليات المركزية - ديوان الوزارة',
    role: 'super_admin',
    status: 'active',
    last_login: new Date().toISOString()
  }
];

export async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'interior_ministry_db';
  const port = Number(process.env.DB_PORT) || 3306;

  try {
    // 1. Attempt connection to MySQL server without database first to ensure DB exists
    const rootConn = await mysql.createConnection({
      host,
      user,
      password,
      port,
      connectTimeout: 2000
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // 2. Create connection pool
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 3. Ensure tables exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        badge_number VARCHAR(50) DEFAULT 'MOI-001',
        rank_title VARCHAR(100) DEFAULT 'عميد شرطة / مدير النظام',
        department VARCHAR(100) DEFAULT 'الإدارة العامة للعمليات والأمن',
        role ENUM('super_admin', 'officer', 'operator', 'auditor') DEFAULT 'super_admin',
        status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
        avatar VARCHAR(255) NULL,
        last_login DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        username VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45) NULL,
        status ENUM('success', 'failed') DEFAULT 'success',
        details TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Ensure default admin user
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1', ['admin', 'admin@moi.gov.ly']);
    if (rows.length === 0) {
      const defaultHash = bcrypt.hashSync('admin', 10);
      await pool.query(`
        INSERT INTO users (username, email, password_hash, full_name, badge_number, rank_title, department, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'admin',
        'admin@moi.gov.ly',
        defaultHash,
        'سيادة العميد / أحمد المهدوي',
        'MOI-10492',
        'عميد شرطة / رئيس مركز العمليات والتحكم',
        'غرفة العمليات المركزية - ديوان الوزارة',
        'super_admin',
        'active'
      ]);
      console.log('✅ تم إنشاء الحساب الافتراضي للمسؤول في قاعدة بيانات MySQL: admin / admin');
    }

    isMySqlConnected = true;
    console.log(`✅ تم الاتصال بنجاح بقاعدة بيانات MySQL (${database}) على المنفذ ${port}`);
  } catch (err) {
    isMySqlConnected = false;
    console.warn('⚠️ تعذر الاتصال بخادم MySQL المباشر (' + err.message + ')');
    console.warn('⚡ تم تفعيل وضع المحاكاة الآمن للبيانات ليعمل النظام فوراً للمستخدم، وعند تشغيل MySQL سيتم الاتصال به تلقائياً.');
  }
}

export function getDb() {
  return { pool, isMySqlConnected, memoryUsers };
}
