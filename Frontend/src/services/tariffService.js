import api from "../api/axios";

const ENDPOINTS = {
  all: "/api/tariffs",
  byId: (id) => `/api/tariffs/${id}`,
};

export const tariffService = {
  list: () =>
    api
      .get(ENDPOINTS.all)
      .then((response) => response.data),

  get: (id) =>
    api
      .get(ENDPOINTS.byId(id))
      .then((response) => response.data),
};

export default tariffService;