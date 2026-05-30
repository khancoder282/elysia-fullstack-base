import Elysia from 'elysia';

import { verifyToken, signAccessToken, getAccessTokenMaxAge } from '../base/jwt';

export default new Elysia()
  .decorate('user', null as null | { email: string })
  .derive(async ({ cookie }) => {
    const accessToken = cookie.accessToken?.value;

    if (accessToken) {
      try {
        const decodedUser = await verifyToken(accessToken as string);
        if (decodedUser && decodedUser.email) {
          return {
            user: {
              email: decodedUser.email,
              role: decodedUser.role
            }
          };
        }
      } catch {
        // Access token is invalid/expired, fall back to refresh token
      }
    }

    const refreshToken = cookie.refreshToken?.value;
    if (refreshToken) {
      try {
        const decodedRefresh = await verifyToken(refreshToken as string);
        if (decodedRefresh && decodedRefresh.email) {
          const newAccessToken = await signAccessToken({
            email: decodedRefresh.email,
            role: decodedRefresh.role
          });

          cookie.accessToken.set({
            value: newAccessToken,
            httpOnly: false,
            secure: true,
            sameSite: 'strict',
            maxAge: getAccessTokenMaxAge(),
            path: '/',
          });

          return { user: { email: decodedRefresh.email, role: decodedRefresh.role } };
        }
      } catch {
        // Refresh token is also invalid/expired
      }
    }

    return { user: null };
  })
  .as('global');