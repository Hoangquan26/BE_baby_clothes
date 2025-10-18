export default () => ({
    app: {
      port: parseInt(process.env.PORT ?? '3000', 10),
    },
    mongodb: {
      uri: process.env.MONGODB_URI ?? '',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? '',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '3600s',
    },
  });