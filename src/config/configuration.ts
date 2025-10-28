export default () => ({
    app: {
      port: parseInt(process.env.PORT ?? '3000', 10),
      name: process.env.APP_NAME ?? 'Baby Shop API',
      description: process.env.APP_DESCRIPTION ?? 'API documentation',
      version: process.env.APP_VERSION ?? '1.0',
    },
    mongodb: {
      uri: process.env.MONGODB_URI ?? '',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? '',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '3600s', // 1 hour
      refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ?? '86400s', // 1 day
      accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET ?? '',
      refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET ?? '',
    },
    hash: {
      auth_salt: 10
    },
    swagger: {
      enabled: (process.env.SWAGGER_ENABLED ?? 'true').toLowerCase() !== 'false',
      path: process.env.SWAGGER_PATH ?? 'docs',
    }
  });
