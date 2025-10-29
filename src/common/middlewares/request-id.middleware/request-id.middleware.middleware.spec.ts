import { RequestIdMiddlewareMiddleware } from './request-id.middleware.middleware';

describe('RequestIdMiddlewareMiddleware', () => {
  it('should be defined', () => {
    expect(new RequestIdMiddlewareMiddleware()).toBeDefined();
  });
});
