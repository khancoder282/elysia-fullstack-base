import type { NewUser } from '../../database/schema';

import { status } from 'elysia';
import { eq } from 'drizzle-orm';

import { db } from '../../database/connect';
import { sendEmail } from '../../base/email';
import { users } from '../../database/schema';
import {
  signAccessToken,
  signRefreshToken,
  signEmailVerifyToken,
  verifyEmailVerifyToken,
  signResetPasswordToken,
  RESET_PASSWORD_EXPIRES,
  verifyResetPasswordToken,
} from '../../base/jwt';

const LOGIN_ERROR_STATUS_MESSAGE: Record<string, string> = {
  'inactive': 'Your account is inactive! Please contact admin for more information!',
  'deleted': 'Your account has been deleted! Please contact admin for more information!',
  'register': 'Your account has not been verified! Please check your email to complete verification!',
  'suspended': 'Your account has been suspended! Please contact admin for more information!',
};

export async function Login(email: string, password: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return status(401, 'User not found!');
  }


  const isValid = await Bun.password.verify(password, user.password);

  if (!isValid) {
    return status(401, 'Password is not correct!');
  }

  if (LOGIN_ERROR_STATUS_MESSAGE[user.status]) {
    return status(401, LOGIN_ERROR_STATUS_MESSAGE[user.status]);
  }

  const accessToken = await signAccessToken({
    email: user.email,
    role: user.role,
  });
  const refreshToken = await signRefreshToken({
    email: user.email,
    role: user.role,
  });

  const { password: _password, id: _id, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

export async function Register(email: string, password: string, name: string) {
  const newUser: NewUser = {
    email,
    password: await Bun.password.hash(password),
    name,
    // status stays 'register' (default) until email is verified
  };

  const [user] = await db.insert(users).values(newUser).returning();
  const { password: _password, id: _id, ...userWithoutPassword } = user;

  // Generate a 15-minute JWT verification token and send the email
  const token = await signEmailVerifyToken(email);
  const appUrl = process.env.APP_URL ?? 'http://localhost:4000';
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

  sendEmail({
    to: email,
    subject: 'Verify your email address',
    template: 'verify-email',
    data: {
      expiresIn: '15 minutes',
      verifyUrl,
      name
    },
  }).catch((err: unknown) => console.error('❌ Failed to send verify email:', err));

  return userWithoutPassword;
}

export async function VerifyEmail(token: string) {
  const email = await verifyEmailVerifyToken(token);

  if (!email) {
    return status(400, 'Verification link is invalid or has expired!');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return status(404, 'User not found!');
  }

  if (user.status !== 'register') {
    return status(409, 'Email is already verified!');
  }

  await db
    .update(users)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(users.email, email));

  return { message: 'Email verified successfully! You can now log in.' };
}

export async function resendVerifyEmail(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return status(404, 'User not found!');
  }

  if (user.status !== 'register') {
    return status(409, 'Email is already verified!');
  }

  // Generate a 15-minute JWT verification token and send the email
  const token = await signEmailVerifyToken(email);
  const appUrl = process.env.APP_URL ?? 'http://localhost:4000';
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

  sendEmail({
    to: email,
    subject: 'Verify your email address',
    template: 'verify-email',
    data: {
      expiresIn: '15 minutes',
      verifyUrl,
      name: user.name
    },
  }).catch((err: unknown) => console.error('❌ Failed to send verify email:', err));

  return { message: 'Verification email sent successfully!' };
}

export async function ForgotPassword(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // Always return success to prevent email enumeration attacks
  if (!user || user.status === 'deleted') {
    return { message: 'If your email is registered, you will receive a reset link shortly.' };
  }

  const token = await signResetPasswordToken(email);
  const appUrl = process.env.APP_URL ?? 'http://localhost:4000';
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  sendEmail({
    to: email,
    subject: 'Reset your password',
    template: 'reset-password',
    data: {
      name: user.name ?? email,
      resetUrl,
      expiresIn: RESET_PASSWORD_EXPIRES,
    },
  }).catch((err: unknown) => console.error('❌ Failed to send reset-password email:', err));

  return { message: 'If your email is registered, you will receive a reset link shortly.' };
}

export async function ResetPassword(token: string, newPassword: string) {
  const email = await verifyResetPasswordToken(token);

  if (!email) {
    return status(400, 'Reset link is invalid or has expired!');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || user.status === 'deleted') {
    return status(404, 'User not found!');
  }

  const hashed = await Bun.password.hash(newPassword);

  await db
    .update(users)
    .set({ password: hashed, updatedAt: new Date() })
    .where(eq(users.email, email));

  return { message: 'Password reset successfully! You can now log in with your new password.' };
}

export async function getMe(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  })
  if (!user) return status(404, 'User not found!')
  const { password: _password, id: _id, ...userWithoutPassword } = user
  return userWithoutPassword
}