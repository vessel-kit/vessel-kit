import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './commons/config.service';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  app.enableCors();
  app.setGlobalPrefix("api");

  // const options = new DocumentBuilder()
  //   .setTitle('Vessel Anchoring')
  //   .setDescription('Implementation of Ceramic protocol Anchoring service')
  //   .setVersion('0.0.1')
  //   .build();
  // const document = SwaggerModule.createDocument(app, options);
  // SwaggerModule.setup('api/swagger', app, document);

  const config = app.get(ConfigService)
  const port = config.current.PORT;
  const host = config.current.HOST;
  await app.listen(port, host);
}

bootstrap();
