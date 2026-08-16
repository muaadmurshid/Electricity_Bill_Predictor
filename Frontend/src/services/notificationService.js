import api from "../api/axios";

const ENDPOINTS = {
  all: "/api/notifications",

  byId: (id) =>
    `/api/notifications/${id}`,

  byHousehold: (householdId) =>
    `/api/notifications/household/${householdId}`,

  unread: (householdId) =>
    `/api/notifications/household/${householdId}/unread`,

  unreadCount: (householdId) =>
    `/api/notifications/household/${householdId}/unread-count`,

  markRead: (id) =>
    `/api/notifications/${id}/read`,

  markUnread: (id) =>
    `/api/notifications/${id}/unread`,

  remove: (id) =>
    `/api/notifications/${id}`,
};

export const notificationService = {
  list: () =>
    api
      .get(ENDPOINTS.all)
      .then((response) => response.data),

  get: (id) =>
    api
      .get(ENDPOINTS.byId(id))
      .then((response) => response.data),

  listByHousehold: (householdId) =>
    api
      .get(
        ENDPOINTS.byHousehold(
          householdId
        )
      )
      .then((response) => response.data),

  unread: (householdId) =>
    api
      .get(
        ENDPOINTS.unread(
          householdId
        )
      )
      .then((response) => response.data),

  unreadCount: (householdId) =>
    api
      .get(
        ENDPOINTS.unreadCount(
          householdId
        )
      )
      .then(
        (response) =>
          Number(
            response.data?.unreadCount ||
              0
          )
      ),

  markRead: (id) =>
    api
      .put(
        ENDPOINTS.markRead(id)
      )
      .then((response) => response.data),

  markUnread: (id) =>
    api
      .put(
        ENDPOINTS.markUnread(id)
      )
      .then((response) => response.data),

  remove: (id) =>
    api
      .delete(
        ENDPOINTS.remove(id)
      ),
};

export default notificationService;