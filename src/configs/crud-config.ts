import { CrudConfigService } from "@dataui/crud";

CrudConfigService.load({
  query: {
    limit: 10,
    alwaysPaginate: true,
  },
});
