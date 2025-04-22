import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { env } from "node:process";
import { parse } from "yaml";

const CONFIG_FOLDER = "config";
const logger = new Logger("LoadConfigModule");

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: getConfigLoaders(["default", env.NODE_ENV]),
    }),
  ],
})
export class LoadConfigModule {}

function getConfigLoaders(configNames: (string | undefined)[]): (() => Record<string, any>)[] {
  const loaders: (() => Record<string, any>)[] = [];
  for (const configName of configNames) {
    if (!configName) {
      continue;
    }

    const loader = createLoaderForConfigName(configName);

    if (loader) {
      loaders.push(loader);
    }
  }

  if (loaders.length === 0) {
    logger.warn("No configuration files were loaded. The loaders array is empty.");
  }

  return loaders;
}

function createLoaderForConfigName(baseName: string): (() => Record<string, any>) | null {
  const yamlPath = join(CONFIG_FOLDER, `${baseName}.yaml`);
  const ymlPath = join(CONFIG_FOLDER, `${baseName}.yml`);

  let configPath: string | null = null;

  if (existsSync(yamlPath)) {
    configPath = yamlPath;
  }
  else if (existsSync(ymlPath)) {
    configPath = ymlPath;
  }
  else {
    logger.warn(`Config file ${yamlPath} or ${ymlPath} does not exist.`);
    return null;
  }

  return () => {
    try {
      const parsedConfig = parse(readFileSync(configPath, "utf8"));
      if (!parsedConfig) {
        logger.warn(`Config file ${configPath} is empty or invalid.`);
        return {};
      }
      logger.log(`Config file ${configPath} loaded successfully.`);
      return parsedConfig;
    }
    catch (error) {
      logger.error(`Error reading or parsing the file ${configPath}:`, error);
      return {};
    }
  };
}
