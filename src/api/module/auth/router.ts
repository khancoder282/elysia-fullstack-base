import { t } from 'elysia';

import { Router } from '../../base/router';
import { app_name } from '../../../../package.json';
import { getAccessTokenMaxAge, getRefreshTokenMaxAge } from '../../base/jwt';
import { Login, getMe, Register, VerifyEmail, ResetPassword, ForgotPassword, resendVerifyEmail } from './handle';

export default Router({
  detail: {
    tags: ['Auth'],
  },
})
  .get('/me', async ({ user, set }) => {
    if (user && user.email) {
      return await getMe(user.email)
    }
    set.status = 401
    return 'Please login before access!'
  })
  .post(
    '/login',
    async ({ body, cookie }) => {
      const { email, password } = body;
      const result = await Login(email, password);

      // If Login returned a status error, pass it through
      if (typeof result !== 'object' || !('user' in result)) {
        return result;
      }

      const { accessToken, refreshToken } = result as {
        accessToken: string;
        refreshToken: string;
        [key: string]: unknown;
      };

      // Set cookies
      cookie.accessToken.set({
        value: accessToken,
        httpOnly: false,
        secure: true,
        sameSite: 'strict',
        maxAge: getAccessTokenMaxAge(),
        path: '/',
      });

      cookie.refreshToken.set({
        value: refreshToken,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: getRefreshTokenMaxAge(),
        path: '/',
      });

      return `Wellcome to ${app_name}`
    },
    {
      body: t.Object({
        email: t.String({ format: 'email', default: 'user@example.com' }),
        password: t.String({
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$',
          error:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.',
        }),
      }),
      response: {
        200: t.String({ description: "An announcement!" }),
        401: t.String({ description: 'An error message for incorrect or unsuccessful login!' }),
        422: t.String({ description: 'Invalid input!' })
      },
      cookie: t.Cookie({
        refreshToken: t.Optional(t.String()),
        accessToken: t.Optional(t.String()),
      })
    },
  )
  .post(
    '/register',
    async ({ body }) => {
      const { email, password, name } = body;
      const user = await Register(email, password, name);
      return `Congratulations ${user.name} you have successfully registered!`
    },
    {
      response: {
        200: t.String({ description: "An announcement!" }),
        409: t.String({ description: 'User already registered!' }),
        422: t.String({ description: 'Invalid input!' })
      },
      body: t.Object({
        name: t.String(),
        email: t.String({ format: 'email', default: 'user@example.com' }),
        password: t.String({
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$',
          error:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.',
        }),
      }),
    },
  )
  .get('/verify-email',
    async ({ query, redirect }) => {
      const result = await VerifyEmail(query.token);
      if (!(result as { code: number, message: string }).code) {
        return redirect(`${process.env.APP_URL}/actions?message=${(result as { code: number, message: string }).message}&action=verify-email`);
      }
      return result
    },
    {
      query: t.Object({
        token: t.String({ description: 'JWT email verification token' }),
      })
    },
  )
  .get('/resend-verify-email', async ({ query }) => await resendVerifyEmail(query.email), {
    query: t.Object({
      email: t.String({ format: 'email', default: 'user@example.com' }),
    }),
  })
  .post(
    '/forgot-password',
    async ({ body }) => ForgotPassword(body.email),
    {
      body: t.Object({
        email: t.String({ format: 'email', default: 'user@example.com' }),
      }),
      response: {
        200: t.Object({ message: t.String() }, { description: 'Reset email sent (or silently skipped if not found)' }),
      },
    },
  )
  .post(
    '/reset-password',
    async ({ body }) => ResetPassword(body.token, body.password),
    {
      body: t.Object({
        token: t.String({ description: 'JWT reset-password token from email link' }),
        password: t.String({
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$',
          error:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.',
        }),
      }),
      response: {
        200: t.Object({ message: t.String() }, { description: 'Password reset successfully' }),
        400: t.String({ description: 'Token invalid or expired' }),
        404: t.String({ description: 'User not found' }),
      },
    },
  );
