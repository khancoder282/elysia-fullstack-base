import { join } from 'node:path';
import Handlebars from 'handlebars';
import { readFileSync } from 'node:fs';

import { env } from './env';
import { transport } from './mailer';
import { app_name } from '../../../package.json';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EmailTemplate = 'welcome' | 'reset-password' | 'verify-email';

interface SendEmailOptions<T extends Record<string, unknown>> {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  data: T;
}

// ---------------------------------------------------------------------------
// Template cache (compile once, reuse)
// ---------------------------------------------------------------------------


function getTemplate(name: EmailTemplate): HandlebarsTemplateDelegate {

  const templatePath = join(process.cwd(), 'template-emails', `${name}.hbs`);
  const source = readFileSync(templatePath, 'utf-8');
  const compiled = Handlebars.compile(source);
  return compiled;
}

// ---------------------------------------------------------------------------
// Default template data injected automatically
// ---------------------------------------------------------------------------

function defaultData() {
  return {
    year: new Date().getFullYear(),
    appName: app_name,
    supportEmail: env.SMTP_FROM,
  };
}

// ---------------------------------------------------------------------------
// sendEmail — the main utility
// ---------------------------------------------------------------------------

/**
 * Renders a Handlebars template and sends it via Nodemailer.
 *
 * @example
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   template: 'welcome',
 *   data: { name: 'Alice', loginUrl: 'https://...' },
 * });
 */
export async function sendEmail<T extends Record<string, unknown>>({
  to,
  subject,
  template,
  data,
}: SendEmailOptions<T>): Promise<void> {
  const compiled = getTemplate(template);
  const html = compiled({ ...defaultData(), ...data });

  await transport.sendMail({
    from: env.SMTP_FROM,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  });
}


