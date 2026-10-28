import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const prisma = new PrismaClient();

/**
 * Test MySQL connection and create database if missing
 */
export async function ensureMySQLDatabase() {
  try {
    const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/crusher_db';
    
    // Parse connection string
    const urlPattern = /mysql:\/\/([^:]*)(?::([^@]*))?@([^:]+):(\d+)\/(.+)/;
    const match = dbUrl.match(urlPattern);
    
    if (match) {
      const [, user, password, host, port, database] = match;
      
      const connection = await mysql.createConnection({
        host: host || 'localhost',
        port: Number(port) || 3306,
        user: user || 'root',
        password: password || ''
      });

      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await connection.end();
      console.log(`[MySQL] Database "${database}" verified/ready.`);
      return true;
    }
  } catch (err) {
    console.warn('[MySQL Note] Could not auto-create database (MySQL service may need starting):', err.message);
    return false;
  }
}

export default prisma;
