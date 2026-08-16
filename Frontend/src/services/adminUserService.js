import api from "../api/axios";

const ENDPOINTS = {
  all: "/api/users",
  byId: (id) => `/api/users/${id}`,
  status: (id) => `/api/users/${id}/status`,
  remove: (id) => `/api/users/${id}`,
};

export const adminUserService = {
  list: () =>
    api
      .get(ENDPOINTS.all)
      .then((response) => response.data),

  get: (id) =>
    api
      .get(ENDPOINTS.byId(id))
      .then((response) => response.data),

  updateStatus: (id, accountStatus) =>
    api
      .put(ENDPOINTS.status(id), {
        accountStatus,
      })
      .then((response) => response.data),

  remove: (id) =>
    api.delete(ENDPOINTS.remove(id)),
};

export default adminUserService;