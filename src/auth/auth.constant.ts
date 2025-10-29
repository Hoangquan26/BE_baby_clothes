
export type AUTH_PAYLOAD_SELECT = {
  sub: string;
  username: string;
}

export type JwtAuthPayload = AUTH_PAYLOAD_SELECT & {
  exp?: number;
  iat?: number;
};

export const AuthCookies = {
  sessionId: 'x-session-id',
  refreshToken: 'x-refresh-token',
  accessToken: 'x-access-token',
}

export const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};