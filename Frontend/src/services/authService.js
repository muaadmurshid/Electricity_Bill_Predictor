import api from "../api/axios";

const ENDPOINTS = {
  login: "/api/auth/login",
  register: "/api/auth/register",
};

export const authService = {
  async login({
    email,
    password,
  }) {
    const response =
      await api.post(
        ENDPOINTS.login,
        {
          email,
          password,
        }
      );

    return response.data;
  },

  async register({
    firstName,
    lastName,
    email,
    password,
  }) {
    const response =
      await api.post(
        ENDPOINTS.register,
        {
          firstName,
          lastName,
          email,
          password,
        }
      );

    return response.data;
  },
};

export default authService;