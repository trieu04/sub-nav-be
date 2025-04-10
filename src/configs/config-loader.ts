import { parse } from "yaml";
import { existsSync, readFileSync } from "node:fs";
import { env } from "node:process";

export const configurations: (() => any)[] = [];

if (existsSync("config/default.yml")) {
  configurations.push(() => parse(readFileSync("config/default.yml", "utf8")));
}

if (existsSync(`config/${env.NODE_ENV}.yml`)) {
  configurations.push(() => parse(readFileSync(`config/${env.NODE_ENV}.yml`, "utf8")));
}
