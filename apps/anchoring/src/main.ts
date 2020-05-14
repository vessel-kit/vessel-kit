import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './commons/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  const config = app.get(ConfigService)
  const port = config.current.PORT;
  const host = config.current.HOST;
  await app.listen(port, host);
}

bootstrap();
