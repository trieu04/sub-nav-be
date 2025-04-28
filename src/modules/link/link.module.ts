import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { DomainsCrudModule } from "./domains-crud/domains-crud.module";
import { LinksCrudModule } from "./links-crud/links-crud.module";
import { RedirectMiddleware } from "./redirect/redirect.middleware";
import { RedirectModule } from "./redirect/redirect.module";

@Module({
  imports: [
    LinksCrudModule,
    RedirectModule,
    DomainsCrudModule,
  ],
})
export class LinkModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RedirectMiddleware).forRoutes("/");
  }
}
