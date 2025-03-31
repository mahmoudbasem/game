
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

// التحقق من وجود رابط قاعدة البيانات
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL غير موجود في متغيرات البيئة");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
