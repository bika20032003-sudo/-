// ملف الاتصال بقاعدة بيانات SQL Server
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم

import sql from 'mssql';

// إعدادات الاتصال بقاعدة البيانات
const sqlConfig: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'BloodBankWMS',
  server: process.env.DB_SERVER || 'localhost',
  pool: {
    max: 10,    // الحد الأقصى للاتصالات
    min: 0,     // الحد الأدنى للاتصالات
    idleTimeoutMillis: 30000, // مهلة الخمول
  },
  options: {
    encrypt: false,              // التشفير - false للتطوير المحلي
    trustServerCertificate: true, // الوثوق بشهادة الخادم
  },
};

// متغير عام لتخزين الاتصال في بيئة التطوير
declare global {
  // eslint-disable-next-line no-var
  var sqlPool: sql.ConnectionPool | undefined;
}

// إنشاء مجمع الاتصالات (Connection Pool)
const poolPromise = (async () => {
  try {
    // إعادة استخدام الاتصال الموجود في بيئة التطوير
    if (global.sqlPool) return global.sqlPool;
    
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    
    // تخزين الاتصال في بيئة التطوير لمنع إعادة الاتصال
    if (process.env.NODE_ENV === 'development') {
      global.sqlPool = pool;
    }
    
    return pool;
  } catch (err) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', err);
    throw err;
  }
})();

// دالة مساعدة لتنفيذ استعلام
export async function executeQuery<T>(
  query: string,
  params?: Record<string, { type: sql.ISqlTypeFactory | sql.ISqlType; value: unknown }>
): Promise<T[]> {
  const pool = await poolPromise;
  const request = pool.request();
  
  // إضافة المعاملات إن وجدت
  if (params) {
    Object.entries(params).forEach(([key, param]) => {
      request.input(key, param.type as any, param.value);
    });
  }
  
  const result = await request.query(query);
  return result.recordset as T[];
}

// دالة مساعدة لتنفيذ استعلام يُرجع سجل واحد
export async function executeQuerySingle<T>(
  query: string,
  params?: Record<string, { type: sql.ISqlTypeFactory | sql.ISqlType; value: unknown }>
): Promise<T | null> {
  const results = await executeQuery<T>(query, params);
  return results.length > 0 ? results[0] : null;
}

// دالة مساعدة لتنفيذ عملية (INSERT, UPDATE, DELETE)
export async function executeCommand(
  query: string,
  params?: Record<string, { type: sql.ISqlTypeFactory | sql.ISqlType; value: unknown }>
): Promise<number> {
  const pool = await poolPromise;
  const request = pool.request();
  
  if (params) {
    Object.entries(params).forEach(([key, param]) => {
      request.input(key, param.type as any, param.value);
    });
  }
  
  const result = await request.query(query);
  return result.rowsAffected[0];
}

export { sql, poolPromise };
