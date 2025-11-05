import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ApplicationLogger } from './common/logger/logger';
import { LogInterceptorInterceptor } from './common/interceptors/log.interceptor/log.interceptor.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './common/swagger/swagger.config';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression'
import helmet from 'helmet'
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter/http-exception.filter.filter';
import { ResponseInterceptorInterceptor } from './common/interceptors/response.interceptor/response.interceptor.interceptor';
import { urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ApplicationLogger(),
  });
  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', { infer: true });
  const reflector = app.get(Reflector)
  app.useGlobalInterceptors(new LogInterceptorInterceptor(), new ResponseInterceptorInterceptor(reflector));
  app.useGlobalFilters(
    new GlobalHttpExceptionFilter()
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
  app.use(compression())
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(helmet())
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
