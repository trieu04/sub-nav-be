import { resolve } from "node:path";

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var appRoot: string;
};

globalThis.appRoot = resolve(__dirname, "../");
