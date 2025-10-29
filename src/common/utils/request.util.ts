import { Request } from "express";
import { AuthCookies } from "src/auth/auth.constant";

export function extractTokenFromHeader(request: Request): string | null {
  const authorization = request.headers['authorization'];
  if (typeof authorization !== 'string') {
    return null;
  }

  const [type, token] = authorization.split(' ');
  if (type?.toLowerCase() === 'bearer' && token) {
    return token;
  }

  return null;
}

export function extractSessionId(request: Request): string | null {
  const sessionHeader = request.cookies[AuthCookies.sessionId];
  if (typeof sessionHeader === 'string' && sessionHeader.trim().length > 0) {
    return sessionHeader.trim();
  }

  if (Array.isArray(sessionHeader) && sessionHeader.length > 0) {
    return sessionHeader[0];
  }

  return null;
}
