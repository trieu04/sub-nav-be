import type { NestMiddleware } from "@nestjs/common";
import { Injectable, Logger } from "@nestjs/common";

import type { Request, Response, NextFunction } from "express";

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, httpVersion, originalUrl } = request;
    const { statusCode } = response;
    const userAgent = request.get("user-agent") || "";

    this.logger.log(
      `${JSON.stringify(`${method} ${originalUrl} HTTP${httpVersion}`)} ${statusCode} ${JSON.stringify(userAgent)} ${JSON.stringify(ip)}`,
    );

    next();
  }
}
