import api from "../api/axios";

const ENDPOINTS = {
  all: "/api/electricity-bills",
  byHousehold: (householdId) =>
    `/api/electricity-bills/household/${householdId}`,
  byId: (id) => `/api/electricity-bills/${id}`,
  create: "/api/electricity-bills",
  update: (id) => `/api/electricity-bills/${id}`,
  remove: (id) => `/api/electricity-bills/${id}`,
};

export const billService = {
  list: () =>
    api
      .get(ENDPOINTS.all)
      .then((response) => response.data),

  listByHousehold: (householdId) =>
    api
      .get(ENDPOINTS.byHousehold(householdId))
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

export default billService;