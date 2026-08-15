import api from "../api/axios";

/**
 * Energy-saving recommendations.
 * Generation runs on the backend (OpenAI). If the key has no credits the
 * call fails — the page must stay up and show a friendly message.
 *
 * CONFIRM AGAINST: AiRecommendationController.java / RecommendationController.java
 */
const ENDPOINTS = {
  generate: "/api/ai-recommendations/generate",
  saved: (householdId) => `/api/recommendations/household/${householdId}`,
  markApplied: (id) => `/api/recommendations/${id}/applied`,
};

export const recommendationService = {
  generate: ({ householdId }) =>
    api.post(ENDPOINTS.generate, null, { params: { householdId } }).then((r) => r.data),
  listByHousehold: (householdId) =>
    api.get(ENDPOINTS.saved(householdId)).then((r) => r.data),
  markApplied: (id) => api.put(ENDPOINTS.markApplied(id)).then((r) => r.data),
};

export default recommendationService;
