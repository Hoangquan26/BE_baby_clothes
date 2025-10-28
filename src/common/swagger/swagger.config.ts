import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const DEFAULT_SWAGGER_PATH = 'docs';

export const SWAGGER_BEARER_NAME = 'access-token';

export function setupSwagger(app: INestApplication) {
  const configService = app.get(ConfigService);
  const appName = configService.get<string>('app.name') ?? 'Baby Shop API';
  const appDescription =
    configService.get<string>('app.description') ?? 'API documentation';
  const version = configService.get<string>('app.version') ?? '1.0';
  const swaggerPath = configService.get<string>('swagger.path') ?? DEFAULT_SWAGGER_PATH;

  const swaggerConfig = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(appDescription)
    .setVersion(version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide the JWT access token obtained from the login endpoint',
      },
      SWAGGER_BEARER_NAME,
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: `${appName} | API Docs`,
  });
}
