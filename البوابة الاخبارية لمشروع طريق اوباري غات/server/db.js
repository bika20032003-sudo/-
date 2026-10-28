import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ubari_ghat_portal',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

export const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('[MySQL] تم الاتصال بقاعدة بيانات MySQL بنجاح:', process.env.DB_NAME || 'ubari_ghat_portal');
    connection.release();
    return true;
  } catch (error) {
    console.warn('[MySQL] تعذر الاتصال بـ MySQL (تأكد من تشغيل خادم MySQL وإنشاء قاعدة البيانات عبر schema.sql):', error.message);
    return false;
  }
};

export default pool;
