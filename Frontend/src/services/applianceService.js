import api from "../api/axios";

const ENDPOINTS = {
  all: "/api/appliances",
  byRoom: (roomId) =>
    `/api/appliances/room/${roomId}`,
  byId: (id) =>
    `/api/appliances/${id}`,
  create: "/api/appliances",
  update: (id) =>
    `/api/appliances/${id}`,
  remove: (id) =>
    `/api/appliances/${id}`,

  image: (id) =>
    `/api/appliances/${id}/image`,
};

export const applianceService = {
  list: () =>
    api
      .get(ENDPOINTS.all)
      .then((response) => response.data),

  listByRoom: (roomId) =>
    api
      .get(ENDPOINTS.byRoom(roomId))
      .then((response) => response.data),

  get: (id) =>
    api
      .get(ENDPOINTS.byId(id))
      .then((response) => response.data),

  create: (payload) =>
    api
      .post(ENDPOINTS.create, payload)
      .then((response) => response.data),

  update: (id, payload) =>
    api
      .put(ENDPOINTS.update(id), payload)
      .then((response) => response.data),

  remove: (id) =>
    api
      .delete(ENDPOINTS.remove(id))
      .then((response) => response.data),

  uploadImage: (id, file) => {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    return api
      .post(
        ENDPOINTS.image(id),
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      )
      .then(
        (response) =>
          response.data
      );
  },

  getImage: (id) =>
    api.get(
      ENDPOINTS.image(id),
      {
        responseType: "blob",
      }
    ),

  deleteImage: (id) =>
    api.delete(
      ENDPOINTS.image(id)
    ),
};

export default applianceService;