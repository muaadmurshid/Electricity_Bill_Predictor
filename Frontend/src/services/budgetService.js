import api from "../api/axios";

/**
 * Monthly budgets. The backend owns the status
 * (WITHIN_BUDGET / WARNING / OVER_BUDGET) — display it, never compute it.
 *
 * CONFIRM AGAINST: BudgetController.java
 */
const ENDPOINTS = {
  byHousehold: (householdId) => `/api/budgets/household/${householdId}`,
  current: (householdId) => `/api/budgets/household/${householdId}/current`,
  create: "/api/budgets",
  update: (id) => `/api/budgets/${id}`,
  remove: (id) => `/api/budgets/${id}`,
};

export const budgetService = {
  listByHousehold: (householdId) =>
    api.get(ENDPOINTS.byHousehold(householdId)).then((r) => r.data),
  current: (householdId) => api.get(ENDPOINTS.current(householdId)).then((r) => r.data),
  create: (payload) => api.post(ENDPOINTS.create, payload).then((r) => r.data),
  update: (id, payload) => api.put(ENDPOINTS.update(id), payload).then((r) => r.data),
  remove: (id) => api.delete(ENDPOINTS.remove(id)).then((r) => r.data),
};

export default budgetService;
