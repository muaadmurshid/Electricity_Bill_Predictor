import api from "../api/axios";

/**
 * Consumption analytics used by the dashboard and the charts.
 * CONFIRM AGAINST: the analytics controller (route group not yet fixed).
 */
const ENDPOINTS = {
  monthly: (householdId) => `/api/analytics/household/${householdId}/monthly`,
  byAppliance: (householdId) => `/api/analytics/household/${householdId}/appliances`,
  byCategory: (householdId) => `/api/analytics/household/${householdId}/categories`,
  highest: (householdId) => `/api/analytics/household/${householdId}/highest`,
  dateRange: (householdId) => `/api/analytics/household/${householdId}/range`,
};

export const analyticsService = {
  monthly: (householdId) => api.get(ENDPOINTS.monthly(householdId)).then((r) => r.data),
  byAppliance: (householdId) =>
    api.get(ENDPOINTS.byAppliance(householdId)).then((r) => r.data),
  byCategory: (householdId) =>
    api.get(ENDPOINTS.byCategory(householdId)).then((r) => r.data),
  highestConsumer: (householdId) =>
    api.get(ENDPOINTS.highest(householdId)).then((r) => r.data),
  dateRange: (householdId, { startDate, endDate }) =>
    api
      .get(ENDPOINTS.dateRange(householdId), { params: { startDate, endDate } })
      .then((r) => r.data),
};

export default analyticsService;
