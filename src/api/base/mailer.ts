import nodemailer from 'nodemailer';

import { env } from './env';

/**
 * Nodemailer transport singleton.
 * Config is read from environment variables via `env`.
 */
export const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});
