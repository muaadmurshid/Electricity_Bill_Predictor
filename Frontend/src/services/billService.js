import api from "../api/axios";

/** Historical electricity bills. CONFIRM AGAINST: ElectricityBillController.java */
const ENDPOINTS = {
  byHousehold: (householdId) => `/api/electricity-bills/household/${householdId}`,
  byId: (id) => `/api/electricity-bills/${id}`,
  create: "/api/electricity-bills",
  update: (id) => `/api/electricity-bills/${id}`,
  remove: (id) => `/api/electricity-bills/${id}`,
};

export const billService = {
  listByHousehold: (householdId) =>
    api.get(ENDPOINTS.byHousehold(householdId)).then((r) => r.data),
  get: (id) => api.get(ENDPOINTS.byId(id)).then((r) => r.data),
  create: (payload) => api.post(ENDPOINTS.create, payload).then((r) => r.data),
  update: (id, payload) => api.put(ENDPOINTS.update(id), payload).then((r) => r.data),
  remove: (id) => api.delete(ENDPOINTS.remove(id)).then((r) => r.data),
};

export default billService;
