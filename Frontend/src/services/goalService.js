import api from "../api/axios";

/**
 * Energy goals. Backend statuses: ON_TRACK / AT_RISK / ACHIEVED / MISSED.
 * CONFIRM AGAINST: EnergyGoalController.java
 */
const ENDPOINTS = {
  byHousehold: (householdId) => `/api/energy-goals/household/${householdId}`,
  active: (householdId) => `/api/energy-goals/household/${householdId}/active`,
  create: "/api/energy-goals",
  update: (id) => `/api/energy-goals/${id}`,
  remove: (id) => `/api/energy-goals/${id}`,
};

export const goalService = {
  listByHousehold: (householdId) =>
    api.get(ENDPOINTS.byHousehold(householdId)).then((r) => r.data),
  active: (householdId) => api.get(ENDPOINTS.active(householdId)).then((r) => r.data),
  create: (payload) => api.post(ENDPOINTS.create, payload).then((r) => r.data),
  update: (id, payload) => api.put(ENDPOINTS.update(id), payload).then((r) => r.data),
  remove: (id) => api.delete(ENDPOINTS.remove(id)).then((r) => r.data),
};

export default goalService;
