import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

interface CreateSessionArgs {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  userAgent?: string | null;
  saltRounds: number;
}

interface SessionSummary {
  id: string;
  expiresAt: Date;
}

const SESSION_ID_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(args: CreateSessionArgs): Promise<SessionSummary> {
    const { userId, refreshToken, expiresAt, userAgent, saltRounds } = args;

    const sessionId = this.generateSessionId();
    const refreshTokenHashed = await bcrypt.hash(refreshToken, saltRounds);

    return this.prisma.userSession.create({
      data: {
        id: sessionId,
        userId,
        userAgent: userAgent?.slice(0, 255) ?? null,
        expiresAt,
        rfTokenHashed: refreshTokenHashed,
      },
      select: {
        id: true,
        expiresAt: true,
      },
    });
  }

  async validateRefreshToken(sessionId: string, refreshToken: string, userId: string) {
    if (!sessionId || !refreshToken) {
      return null;
    }

    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    const isValid = await bcrypt.compare(refreshToken, session.rfTokenHashed);
    if (!isValid) {
      return null;
    }
    console.log(session)
    console.log(`log::: ${refreshToken}`)
    console.log(`log::: ${isValid}`)
    return session;
  }

  async rotateRefreshToken(
    sessionId: string,
    refreshToken: string,
    expiresAt: Date,
    saltRounds: number,
  ) {
    console.log(`saverf:::${refreshToken}`)
    const refreshTokenHashed = await bcrypt.hash(refreshToken, saltRounds);
    console.log(`saverf:::${refreshTokenHashed}`)

    return this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        rfTokenHashed: refreshTokenHashed,
        expiresAt,
      },
      select: {
        id: true,
        expiresAt: true,
      },
    });
  }

  async deleteSession(sessionId: string) {
    if (!sessionId) {
      return;
    }

    await this.prisma.userSession
      .delete({
        where: { id: sessionId },
      })
      .catch(() => undefined);
  }

  private generateSessionId(length = 26): string {
    let result = '';
    const alphabetLength = SESSION_ID_ALPHABET.length;
    while (result.length < length) {
      const random = Math.floor(Math.random() * alphabetLength);
      result += SESSION_ID_ALPHABET[random];
    }
    return result;
  }

  async isSessionActive(sessionId: string, userId: string): Promise<boolean> {
    if (!sessionId || !userId) {
      return false;
    }

    const found = await this.prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    return Boolean(found);
  }
}
