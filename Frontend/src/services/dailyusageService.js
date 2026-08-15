import api from "../api/axios";

const ENDPOINTS = {
  all: "/api/daily-usage",
  byId: (id) => `/api/daily-usage/${id}`,
  create: "/api/daily-usage",
  update: (id) => `/api/daily-usage/${id}`,
  remove: (id) => `/api/daily-usage/${id}`,
};

export const usageService = {
  list: () =>
    api
      .get(ENDPOINTS.all)
      .then((response) => response.data),

  get: (id) =>
    api
      .get(ENDPOINTS.byId(id))
      .then((response) => response.data),

  create: (payload) =>
    api
      .post(ENDPOINTS.create, payload)
      .then((response) => response.data),

  update: (id, payload) =>
    api
      .put(ENDPOINTS.update(id), payload)
      .then((response) => response.data),

  remove: (id) =>
    api
      .delete(ENDPOINTS.remove(id))
      .then((response) => response.data),
};

export default usageService;