import api from "../api/axios";

const ENDPOINTS = {
  dashboard: "/api/admin/dashboard",
};

export const adminService = {
  getDashboard: () =>
    api
      .get(ENDPOINTS.dashboard)
      .then((response) => response.data),
};

export default adminService;