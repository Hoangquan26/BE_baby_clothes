import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ApplicationLogger } from './common/logger/logger';
import { LogInterceptorInterceptor } from './common/interceptors/log.interceptor/log.interceptor.interceptor';
import { NotfoundFilterFilter } from './common/filters/notfound.filter/notfound.filter.filter';
import { ValidationPipe } from '@nestjs/common';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter/validation-exception.filter';
import { setupSwagger } from './common/swagger/swagger.config';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ApplicationLogger(),
  });
  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', { infer: true });

  app.useGlobalInterceptors(new LogInterceptorInterceptor());
  app.useGlobalFilters(
    new NotfoundFilterFilter(),
    new ValidationExceptionFilter(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties without decorators
      forbidNonWhitelisted: true, // throw when extra fields provided
      transform: true, // auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use(cookieParser());
  app.use(helmet())
  app.use(compression())
  // app.enableCors({
  //   credentials: true,
  // });
  const swaggerEnabled = config.get<boolean>('swagger.enabled', {
    infer: true,
  });
  if (swaggerEnabled ?? true) {
    setupSwagger(app);
  }

  await app.listen(port, () => {
    console.log(`!app running on port: ${port}`);
  });
}
bootstrap();
