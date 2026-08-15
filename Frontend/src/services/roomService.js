import api from "../api/axios";

/** Room module. CONFIRM AGAINST: RoomController.java */
const ENDPOINTS = {
  byHousehold: (householdId) => `/api/rooms/household/${householdId}`,
  byId: (id) => `/api/rooms/${id}`,
  create: "/api/rooms",
  update: (id) => `/api/rooms/${id}`,
  remove: (id) => `/api/rooms/${id}`,
};

export const roomService = {
  listByHousehold: (householdId) =>
    api.get(ENDPOINTS.byHousehold(householdId)).then((r) => r.data),
  get: (id) => api.get(ENDPOINTS.byId(id)).then((r) => r.data),
  create: (payload) => api.post(ENDPOINTS.create, payload).then((r) => r.data),
  update: (id, payload) => api.put(ENDPOINTS.update(id), payload).then((r) => r.data),
  remove: (id) => api.delete(ENDPOINTS.remove(id)).then((r) => r.data),
};

export default roomService;
