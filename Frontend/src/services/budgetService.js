import api from "../api/axios";

const ENDPOINTS = {
  all: "/api/budgets",
  byId: (id) => `/api/budgets/${id}`,
  create: "/api/budgets",
  update: (id) => `/api/budgets/${id}`,
  remove: (id) => `/api/budgets/${id}`,
};

export const budgetService = {
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

export default budgetService;