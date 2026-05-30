import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '../src/api/base/env';

const sql = postgres(env.DATABASE_URL, { max: 1 });
const db = drizzle(sql);

console.log('⏳ Running database migrations...');

try {
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('✅ Migrations applied successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  await sql.end();
}
