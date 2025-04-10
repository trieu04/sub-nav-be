import "./configs/crud-config";
import "./configs/vars";

import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { configSwagger } from "./configs/swagger";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  // Enable CORS
  app.enableCors();

  // Config Swagger
  configSwagger(app);

  // Get the port from the config
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get("app.port") || 3000;

  // Start the app
  await app.listen(port, () => {
    logger.log(`Server is running on port ${port}`);
  });

  // Hot Module Replacement
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
