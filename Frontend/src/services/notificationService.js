import api from "../api/axios";

/**
 * Notifications: BUDGET_WARNING, BUDGET_EXCEEDED, GOAL_AT_RISK, GOAL_MISSED.
 * CONFIRM AGAINST: NotificationController.java
 */
const ENDPOINTS = {
  byHousehold: (householdId) => `/api/notifications/household/${householdId}`,
  unread: (householdId) => `/api/notifications/household/${householdId}/unread`,
  unreadCount: (householdId) => `/api/notifications/household/${householdId}/unread-count`,
  markRead: (id) => `/api/notifications/${id}/read`,
  markUnread: (id) => `/api/notifications/${id}/unread`,
};

export const notificationService = {
  listByHousehold: (householdId) =>
    api.get(ENDPOINTS.byHousehold(householdId)).then((r) => r.data),
  unread: (householdId) => api.get(ENDPOINTS.unread(householdId)).then((r) => r.data),
  unreadCount: (householdId) =>
    api.get(ENDPOINTS.unreadCount(householdId)).then((r) => r.data),
  markRead: (id) => api.put(ENDPOINTS.markRead(id)).then((r) => r.data),
  markUnread: (id) => api.put(ENDPOINTS.markUnread(id)).then((r) => r.data),
};

export default notificationService;
