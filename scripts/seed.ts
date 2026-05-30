import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '../src/api/base/env';
import { users } from '../src/api/database/schema/user';

const sql = postgres(env.DATABASE_URL, { max: 1 });
const db = drizzle(sql);

async function seed() {
  console.log('⏳ Seeding super admin...');

  const superAdminEmail = 'superadmin@example.com';
  const hashedPassword = await Bun.password.hash('SuperAdmin@1234');

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, superAdminEmail))
      .limit(1);

    if (existing.length > 0) {
      console.log('ℹ️ Super admin already exists.');
      return;
    }

    await db.insert(users).values({
      email: superAdminEmail,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super-admin',
      status: 'active',
    });

    console.log('✅ Super admin seeded successfully!');
    console.log(`📧 Email: ${superAdminEmail}`);
    console.log('🔑 Password: SuperAdmin@1234');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();
