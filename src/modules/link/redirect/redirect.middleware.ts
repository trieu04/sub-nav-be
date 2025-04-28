import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { RedirectService } from "./redirect.service";

@Injectable()
export class RedirectMiddleware implements NestMiddleware {
  constructor(
    private readonly redirectService: RedirectService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const domainName = req.host;
    const key = req.url.replace(/^\/+/, '');

    const destination = await this.redirectService.getLink(key, domainName);
    if (destination) {
      return res.redirect(destination);
    }

    next();
  }
}
