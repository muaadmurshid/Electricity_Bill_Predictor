import api from "../api/axios";

const ENDPOINT = "/api/appliance-vision/analyse";

export const applianceVisionService = {
  analyse: (file) => {
    const formData = new FormData();

    formData.append("file", file);

    return api
      .post(
        ENDPOINT,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => response.data);
  },
};

export default applianceVisionService;