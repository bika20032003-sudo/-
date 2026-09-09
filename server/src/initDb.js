import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function runDatabaseInit() {
  const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/crusher_db';
  console.log('[Database Init] Connecting to MySQL using:', dbUrl);

  const urlPattern = /mysql:\/\/([^:]*)(?::([^@]*))?@([^:]+):(\d+)\/(.+)/;
  const match = dbUrl.match(urlPattern);

  if (!match) {
    console.error('Invalid DATABASE_URL format.');
    return;
  }

  const [, user, password, host, port, database] = match;

  try {
    const connection = await mysql.createConnection({
      host: host || 'localhost',
      port: Number(port) || 3306,
      user: user || 'root',
      password: password || '',
      multipleStatements: true
    });

    console.log('[Database Init] Connected to MySQL successfully.');

    let sqlPath = path.resolve(process.cwd(), 'sql/database_schema.sql');
    if (!fs.existsSync(sqlPath)) {
      sqlPath = path.resolve(process.cwd(), 'server/sql/database_schema.sql');
    }

    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      console.log('[Database Init] Executing schema SQL script...');
      await connection.query(sqlContent);
      console.log('[Database Init] ✅ Database and tables created and seeded successfully!');
    } else {
      console.warn('[Database Init] SQL file not found at:', sqlPath);
    }

    await connection.end();
  } catch (err) {
    console.error('[Database Init Error]:', err.message);
    console.log('Ensure MySQL is running (e.g., in XAMPP / WampServer / Services).');
  }
}

runDatabaseInit();
