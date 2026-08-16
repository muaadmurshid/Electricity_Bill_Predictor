import api from "../api/axios";

const ENDPOINTS = {
  tariffs: "/api/tariffs",
  tariff: (id) => `/api/tariffs/${id}`,

  rates: "/api/tariff-rates",
  rate: (id) => `/api/tariff-rates/${id}`,
  ratesByTariff: (tariffId) =>
    `/api/tariff-rates/tariff/${tariffId}`,
};

export const adminTariffService = {
  listTariffs: () =>
    api.get(ENDPOINTS.tariffs).then((r) => r.data),

  getTariff: (id) =>
    api.get(ENDPOINTS.tariff(id)).then((r) => r.data),

  createTariff: (payload) =>
    api.post(ENDPOINTS.tariffs, payload).then((r) => r.data),

  updateTariff: (id, payload) =>
    api.put(ENDPOINTS.tariff(id), payload).then((r) => r.data),

  deleteTariff: (id) =>
    api.delete(ENDPOINTS.tariff(id)),

  listRates: () =>
    api.get(ENDPOINTS.rates).then((r) => r.data),

  listRatesByTariff: (tariffId) =>
    api
      .get(ENDPOINTS.ratesByTariff(tariffId))
      .then((r) => r.data),

  createRate: (payload) =>
    api.post(ENDPOINTS.rates, payload).then((r) => r.data),

  updateRate: (id, payload) =>
    api.put(ENDPOINTS.rate(id), payload).then((r) => r.data),

  deleteRate: (id) =>
    api.delete(ENDPOINTS.rate(id)),
};

export default adminTariffService;