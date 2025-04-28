import { All, Controller, Param, Req, Res } from "@nestjs/common";
import { RedirectService } from "./redirect.service";
import { Request, Response } from "express";

export const REDIRECT_PATH = "/l";

@Controller(REDIRECT_PATH)
export class RedirectController {
  constructor(private service: RedirectService) {}

  @All(":key")
  async handleLink(@Param("key") key: string, @Req() req: Request, @Res() res: Response) {
    const domainName = req.hostname;
    return this.service.handleLink(key, domainName, res);
  }
}
