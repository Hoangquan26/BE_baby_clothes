import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MyLoggerDev } from './common/logger/my.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });
  app.useLogger(app.get(MyLoggerDev))
  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', { infer: true });
  await app.listen(port, () => {
    console.log(`!app running on port: ${port}`)
  });
}
bootstrap();
