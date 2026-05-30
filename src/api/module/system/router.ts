import { sql } from 'drizzle-orm';

import { Router } from '../../base/router';
import { db } from '../../database/connect';
import { version } from '../../../../package.json';
import { getPermissionByRole } from '../../base/role';

export default Router({
  detail: {
    tags: ['System']
  },
})
  .get('/version', () => version)
  .get('/health', () => 'Ok')
  .get('/db-check', async () => {
    try {
      await db.execute(sql`SELECT 1`);
      return {
        status: 'connected' as const,
        database: 'PostgreSQL',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'disconnected' as const,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  })
  .get('/role-mapping', () => ({
    'user': getPermissionByRole('user'),
    'admin': getPermissionByRole('admin'),
    'super-admin': getPermissionByRole('super-admin'),
  }))
