import api from "../api/axios";

const ENDPOINTS = {
  generate:
    "/api/ai-recommendations/generate",

  all:
    "/api/recommendations",

  byId: (id) =>
    `/api/recommendations/${id}`,

  byHousehold: (householdId) =>
    `/api/recommendations/household/${householdId}`,

  predictionHistory: (householdId) =>
    `/api/bill-predictions/household/${householdId}`,

  analytics: (householdId) =>
    `/api/daily-usage/household/${householdId}/analytics`,

  remove: (id) =>
    `/api/recommendations/${id}`,
};

export const recommendationService = {
  generate: (payload) =>
    api
      .post(
        ENDPOINTS.generate,
        payload
      )
      .then(
        (response) =>
          response.data
      ),

  list: () =>
    api
      .get(
        ENDPOINTS.all
      )
      .then(
        (response) =>
          response.data
      ),

  get: (id) =>
    api
      .get(
        ENDPOINTS.byId(id)
      )
      .then(
        (response) =>
          response.data
      ),

  listByHousehold: (
    householdId
  ) =>
    api
      .get(
        ENDPOINTS.byHousehold(
          householdId
        )
      )
      .then(
        (response) =>
          response.data
      ),

  predictionHistory: (
    householdId
  ) =>
    api
      .get(
        ENDPOINTS.predictionHistory(
          householdId
        )
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

  remove: (id) =>
    api.delete(
      ENDPOINTS.remove(id)
    ),
};

export default recommendationService;