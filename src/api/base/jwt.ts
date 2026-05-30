import type { JWTPayload } from 'jose';

export const EMAIL_VERIFY_EXPIRES = '15m';

import { SignJWT, jwtVerify } from 'jose';

import { env } from './env';

const secret = new TextEncoder().encode(env.JWT_SECRET);

/**
 * Parse duration string (e.g. '15m', '3d', '1h') to seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      throw new Error(`Unknown duration unit: ${unit}`);
  }
}

export async function signAccessToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.ACCESS_TOKEN_EXPIRES)
    .sign(secret);
}

export async function signRefreshToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.REFRESH_TOKEN_EXPIRES)
    .sign(secret);
}

export async function verifyToken(token: string | undefined) {
  if (!token) return null
  const { payload } = await jwtVerify(token, secret);
  return payload as {
    email: string,
    role: string,
    iat: number,
    exp: number
  };
}

/**
 * Sign a short-lived (15 min) token used for email verification links.
 */
export async function signEmailVerifyToken(email: string) {
  return new SignJWT({ email, purpose: 'email-verify' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EMAIL_VERIFY_EXPIRES)
    .sign(secret);
}

/**
 * Verify the email-verification token and return the email on success,
 * or null if invalid / expired / wrong purpose.
 */
export async function verifyEmailVerifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.purpose !== 'email-verify' || typeof payload.email !== 'string') return null;
    return payload.email;
  } catch {
    return null;
  }
}

export const RESET_PASSWORD_EXPIRES = '15m';

/**
 * Sign a short-lived (15 min) token used for password reset links.
 */
export async function signResetPasswordToken(email: string) {
  return new SignJWT({ email, purpose: 'reset-password' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(RESET_PASSWORD_EXPIRES)
    .sign(secret);
}

/**
 * Verify the reset-password token and return the email on success,
 * or null if invalid / expired / wrong purpose.
 */
export async function verifyResetPasswordToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.purpose !== 'reset-password' || typeof payload.email !== 'string') return null;
    return payload.email;
  } catch {
    return null;
  }
}

/**
 * Get the max-age in seconds for cookie expiry
 */
export function getAccessTokenMaxAge() {
  return parseDuration(env.ACCESS_TOKEN_EXPIRES);
}

export function getRefreshTokenMaxAge() {
  return parseDuration(env.REFRESH_TOKEN_EXPIRES);
}
