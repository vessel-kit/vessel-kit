import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "./commons/config.service";
const bodyParser = require("body-parser");

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const config = app.get(ConfigService);
  app.use(bodyParser.json({ limit: "50mb" }));
  const port = config.current.PORT;
  const host = config.current.HOST;
  await app.listen(port, host);
}
bootstrap();
