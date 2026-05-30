import { t } from 'elysia';
import { Value } from '@sinclair/typebox/value';

const EnvSchema = t.Object({
  DATABASE_URL: t.String({ minLength: 1 }),
  PORT: t.Number(),
  JWT_SECRET: t.String({ minLength: 1 }),
  ACCESS_TOKEN_EXPIRES: t.String({ minLength: 1 }),
  REFRESH_TOKEN_EXPIRES: t.String({ minLength: 1 }),
  SMTP_HOST: t.String({ minLength: 1 }),
  SMTP_PORT: t.Number(),
  SMTP_USER: t.String({ minLength: 1 }),
  SMTP_PASS: t.String({ minLength: 1 }),
  SMTP_FROM: t.String({ minLength: 1 }),
});

const rawEnv = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  PORT: Number(process.env.PORT || 3000),
  JWT_SECRET: process.env.JWT_SECRET || '',
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || '3d',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT || 2525),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
};

if (!Value.Check(EnvSchema, rawEnv)) {
  const errors = [...Value.Errors(EnvSchema, rawEnv)];
  console.error(
    '❌ Environment validation failed:',
    errors.map((e) => `${e.path}: ${e.message}`).join(', '),
  );
  throw new Error('Invalid environment variables. Please check your .env file.');
}

export const env = rawEnv as {
  DATABASE_URL: string;
  PORT: number;
  JWT_SECRET: string;
  ACCESS_TOKEN_EXPIRES: string;
  REFRESH_TOKEN_EXPIRES: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM: string;
};
