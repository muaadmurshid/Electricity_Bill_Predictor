import api from "../api/axios";

const ENDPOINTS = {
  consumption: (householdId) =>
    `/api/daily-usage/household/${householdId}/consumption`,

  monthlySummary: (householdId) =>
    `/api/daily-usage/household/${householdId}/monthly-summary`,

  applianceBreakdown: (householdId) =>
    `/api/daily-usage/household/${householdId}/appliance-breakdown`,

  highestConsumer: (householdId) =>
    `/api/daily-usage/household/${householdId}/highest-consuming-appliance`,

  categoryBreakdown: (householdId) =>
    `/api/daily-usage/household/${householdId}/category-breakdown`,

  analytics: (householdId) =>
    `/api/daily-usage/household/${householdId}/analytics`,
};

export const analyticsService = {
  consumption: (
    householdId,
    startDate,
    endDate
  ) =>
    api
      .get(
        ENDPOINTS.consumption(
          householdId
        ),
        {
          params: {
            startDate,
            endDate,
          },
        }
      )
      .then(
        (response) =>
          response.data
      ),

  monthlySummary: (
    householdId,
    year,
    month
  ) =>
    api
      .get(
        ENDPOINTS.monthlySummary(
          householdId
        ),
        {
          params: {
            year,
            month,
          },
        }
      )
      .then(
        (response) =>
          response.data
      ),

  applianceBreakdown: (
    householdId,
    startDate,
    endDate
  ) =>
    api
      .get(
        ENDPOINTS.applianceBreakdown(
          householdId
        ),
        {
          params: {
            startDate,
            endDate,
          },
        }
      )
      .then(
        (response) =>
          response.data
      ),

  highestConsumer: (
    householdId,
    startDate,
    endDate
  ) =>
    api
      .get(
        ENDPOINTS.highestConsumer(
          householdId
        ),
        {
          params: {
            startDate,
            endDate,
          },
        }
      )
      .then(
        (response) =>
          response.data
      ),

  categoryBreakdown: (
    householdId,
    startDate,
    endDate
  ) =>
    api
      .get(
        ENDPOINTS.categoryBreakdown(
          householdId
        ),
        {
          params: {
            startDate,
            endDate,
          },
        }
      )
      .then(
        (response) =>
          response.data
      ),

  analytics: (
    householdId,
    startDate,
    endDate
  ) =>
    api
      .get(
        ENDPOINTS.analytics(
          householdId
        ),
        {
          params: {
            startDate,
            endDate,
          },
        }
      )
      .then(
        (response) =>
          response.data
      ),
};

export default analyticsService;