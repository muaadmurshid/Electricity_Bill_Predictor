import api from "../api/axios";

/**
 * ML bill prediction. React talks to Spring Boot only — never to the
 * FastAPI service on port 8000.
 *
 * CONFIRM AGAINST: MlController.java / BillPredictionController.java
 */
const ENDPOINTS = {
  predict: "/api/ml/predict-household",
  historyByHousehold: (householdId) => `/api/bill-predictions/household/${householdId}`,
  latestByHousehold: (householdId) =>
    `/api/bill-predictions/household/${householdId}/latest`,
};

export const predictionService = {
  /** POST /api/ml/predict-household?householdId=1&tariffId=1&year=2026&month=9 */
  predict: ({ householdId, tariffId, year, month }) =>
    api
      .post(ENDPOINTS.predict, null, {
        params: { householdId, tariffId, year, month },
      })
      .then((r) => r.data),

  history: (householdId) =>
    api.get(ENDPOINTS.historyByHousehold(householdId)).then((r) => r.data),

  latest: (householdId) =>
    api.get(ENDPOINTS.latestByHousehold(householdId)).then((r) => r.data),
};

export default predictionService;
