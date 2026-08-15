import api from "../api/axios";

/**
 * These two endpoints are the ones confirmed in the project spec.
 * Both are public (no JWT required) and both return a token.
 *
 * Expected login response:
 * {
 *   userId, firstName, lastName, email,
 *   token, tokenType: "Bearer", message
 * }
 */

const ENDPOINTS = {
  login: "/api/auth/login",
  register: "/api/auth/register",
};

export const authService = {
  async login({ email, password }) {
    const { data } = await api.post(ENDPOINTS.login, { email, password });
    return data;
  },

  async register({ firstName, lastName, email, password }) {
    const { data } = await api.post(ENDPOINTS.register, {
      firstName,
      lastName,
      email,
      password,
    });
    return data;
  },
};

export default authService;
