import { CrudConfigService } from "@dataui/crud";

CrudConfigService.load({
  query: {
    limit: 10,
    alwaysPaginate: true,
  },
  params: {
    id: {
      field: "id",
      type: "uuid",
      primary: true,
    },
  },
});
