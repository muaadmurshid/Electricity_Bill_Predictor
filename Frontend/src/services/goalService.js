import api from "../api/axios";

const ENDPOINTS = {
  all: "/api/energy-goals",
  byId: (id) => `/api/energy-goals/${id}`,
  byHousehold: (householdId) =>
    `/api/energy-goals/household/${householdId}`,
  create: "/api/energy-goals",
  update: (id) => `/api/energy-goals/${id}`,
  remove: (id) => `/api/energy-goals/${id}`,
};

export const goalService = {
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

export default goalService;