import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LoginAuthDTO } from './dto/login-auth.dto';
import { RegisterAuthDTO } from './dto/register-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthGuard } from 'src/common/guard/auth/auth.guard';
import { RefreshTokenGuard } from 'src/common/guard/auth/refresh-token.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    login: jest.Mock;
    register: jest.Mock;
    refreshToken: jest.Mock;
    getUserInfo: jest.Mock;
    logout: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      refreshToken: jest.fn(),
      getUserInfo: jest.fn(),
      logout: jest.fn(),
    };

    const moduleBuilder = Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .overrideGuard(RefreshTokenGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) });

    const module: TestingModule = await moduleBuilder.compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('logs and forwards login request to service, setting cookies when present', async () => {
    const req = {
      headers: {
        'user-agent': 'jest-agent',
      },
    } as unknown as Request;
    const res = {
      cookie: jest.fn(),
    } as unknown as Response;
    const dto = {
      username: 'johnsmith',
      password: 'Password1!',
      rememberMe: true,
    } as LoginAuthDTO;
    const expected = {
      tokenType: 'Bearer',
      accessToken: 'abc',
      refreshToken: 'refresh',
      sessionId: 'session-1',
    };
    authService.login.mockResolvedValue(expected);
    const logSpy = jest.spyOn((controller as any).logger, 'log');

    const result = await controller.login(req, res, dto);

    expect(result).toBe(expected);
    expect(authService.login).toHaveBeenCalledWith(dto, {
      userAgent: 'jest-agent',
    });
    expect(res.cookie).toHaveBeenCalledWith('x-access-token', 'abc', expect.any(Object));
    expect(res.cookie).toHaveBeenCalledWith('x-refresh-token', 'refresh', expect.any(Object));
    expect(res.cookie).toHaveBeenCalledWith('x-session-id', 'session-1', expect.any(Object));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('johnsmith'));
  });

  it('logs register requests', async () => {
    const dto = {
      username: 'newuser',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      email: 'user@example.com',
    } as RegisterAuthDTO;
    authService.register.mockResolvedValue({ id: '1' });
    const logSpy = jest.spyOn((controller as any).logger, 'log');

    await controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('newuser'));
  });

  it('logs refresh requests', async () => {
    const req = {
      refreshToken: 'refresh-token',
      sessionId: 'session-1',
      user: { sub: 'user-1', id: 'user-1', username: 'johnsmith', email: 'user@example.com' },
    } as unknown as any;
    const expected = { tokenType: 'Bearer', accessToken: 'xyz' };
    authService.refreshToken.mockResolvedValue(expected);
    const logSpy = jest.spyOn((controller as any).logger, 'log');

    const res = { cookie: jest.fn(), clearCookie: jest.fn() } as unknown as Response;
    const result = await controller.refresh(req, res);

    expect(result).toBe(expected);
    expect(authService.refreshToken).toHaveBeenCalledWith({
      refreshToken: 'refresh-token',
      sessionId: 'session-1',
      user: { sub: 'user-1', id: 'user-1', username: 'johnsmith', email: 'user@example.com' },
    });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('session-1'));
  });

  it('logs logout requests and clears cookies', async () => {
    const req = {
      sessionId: 'session-2',
    } as unknown as Request;
    const res = {
      clearCookie: jest.fn(),
    } as unknown as Response;
    const logSpy = jest.spyOn((controller as any).logger, 'log');
    authService.logout.mockResolvedValue(undefined);

    const result = await controller.logout(req, res);

    expect(authService.logout).toHaveBeenCalledWith('session-2');
    expect(res.clearCookie).toHaveBeenCalledWith('x-refresh-token');
    expect(res.clearCookie).toHaveBeenCalledWith('x-session-id');
    expect(res.clearCookie).toHaveBeenCalledWith('x-access-token');
    expect(result).toEqual({ success: true });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('session-2'));
  });
});





