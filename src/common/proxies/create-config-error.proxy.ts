import { ModuleConfigException } from "../exceptions/module-config.exception";

export function createConfigErrorProxy<T extends object>(
  target: T,
  baseErrorMessage: string = "Required configuration is missing",
): T {
  const className = target?.constructor?.name || "Object";

  const handler: ProxyHandler<T> = {
    get: (proxiedTarget: T, prop: string | symbol, receiver: any): any => {
      if (prop in proxiedTarget) {
        const errorMessage = `${baseErrorMessage} for '${className}'. Cannot access property '${String(prop)}'.`;
        throw new ModuleConfigException(errorMessage);
      }

      return Reflect.get(proxiedTarget, prop, receiver);
    },

    set: (proxiedTarget: T, prop: string | symbol, value: any, receiver: any): boolean => {
      if (prop in proxiedTarget) {
        const errorMessage = `${baseErrorMessage} for '${className}'. Cannot set property '${String(prop)}'.`;
        throw new ModuleConfigException(errorMessage);
      }
      return Reflect.set(proxiedTarget, prop, value, receiver);
    },
  };

  return new Proxy(target, handler);
}
