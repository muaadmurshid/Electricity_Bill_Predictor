import api from "../api/axios";

/**
 * Household module.
 * The backend reads the owner from the JWT — never send a userId.
 *
 * CONFIRM AGAINST: HouseholdController.java
 */
const ENDPOINTS = {
  list: "/api/households",
  byId: (id) => `/api/households/${id}`,
  create: "/api/households",
  update: (id) => `/api/households/${id}`,
  remove: (id) => `/api/households/${id}`,
};

export const householdService = {
  list: () => api.get(ENDPOINTS.list).then((r) => r.data),
  get: (id) => api.get(ENDPOINTS.byId(id)).then((r) => r.data),
  create: (payload) => api.post(ENDPOINTS.create, payload).then((r) => r.data),
  update: (id, payload) => api.put(ENDPOINTS.update(id), payload).then((r) => r.data),
  remove: (id) => api.delete(ENDPOINTS.remove(id)).then((r) => r.data),
};

export default householdService;
