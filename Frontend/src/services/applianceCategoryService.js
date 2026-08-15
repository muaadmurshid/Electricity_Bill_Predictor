import api from "../api/axios";

const ENDPOINTS = {
  all: "/api/appliance-categories",
  byId: (id) => `/api/appliance-categories/${id}`,
};

export const applianceCategoryService = {
  list: () =>
    api
      .get(ENDPOINTS.all)
      .then((response) => response.data),

  get: (id) =>
    api
      .get(ENDPOINTS.byId(id))
      .then((response) => response.data),
};

export default applianceCategoryService;