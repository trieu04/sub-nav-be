export enum LinkPatternEnum {
  DIRECT = "direct",
  PREFIX = "prefix",
}

// Overloads
export function buildLinkFromPattern(
  pattern: LinkPatternEnum.DIRECT,
  data: { domain: string; key: string }
): string;
export function buildLinkFromPattern(
  pattern: LinkPatternEnum.PREFIX,
  data: { domain: string; key: string; prefix: string }
): string;

// Implementation
export function buildLinkFromPattern(pattern: LinkPatternEnum, data: any): string {
  if (pattern === LinkPatternEnum.DIRECT) {
    const template = "https://{domain}/{key}";
    return renderTemplate(template, data);
  }

  if (pattern === LinkPatternEnum.PREFIX) {
    const template = "https://{domain}/{prefix}{key}";
    return renderTemplate(template, data);
  }

  throw new Error(`Unknown pattern: ${pattern}`);
}

function renderTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{(.*?)\}/g, (_, key) => {
    return key in data ? data[key] : `{${key}}`;
  });
}
