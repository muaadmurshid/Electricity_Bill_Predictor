import api from "../api/axios";

const ENDPOINTS = {
  all: "/api/appliances",
  byRoom: (roomId) => `/api/appliances/room/${roomId}`,
  byId: (id) => `/api/appliances/${id}`,
  create: "/api/appliances",
  update: (id) => `/api/appliances/${id}`,
  remove: (id) => `/api/appliances/${id}`,
};

export const applianceService = {
  list: () =>
    api.get(ENDPOINTS.all).then((response) => response.data),

  listByRoom: (roomId) =>
    api
      .get(ENDPOINTS.byRoom(roomId))
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

export default applianceService;