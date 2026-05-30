import Elysia, { env } from 'elysia';
import { swagger } from '@elysiajs/swagger';

export default new Elysia().use(
  swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'LMS API - anhtester',
        version: '1.0.0',
        description: 'Learning Management System API Documentation',
        contact: {
          name: 'anhtester',
          url: 'https://anhtester.com',
        },
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server',
        },
      ],
    },
    scalarConfig: {
      theme: 'kepler',
    },
  }),
);
