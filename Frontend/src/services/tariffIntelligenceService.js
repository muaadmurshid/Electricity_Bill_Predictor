import api from "../api/axios";

const tariffIntelligenceService = {
  getIntelligence: async (
    tariffId,
    units
  ) => {
    const response =
      await api.get(
        "/api/tariff-intelligence",
        {
          params: {
            tariffId,
            units,
          },
        }
      );

    return response.data;
  },

  calculateWhatIf: async (
    tariffId,
    currentUnits,
    targetUnits
  ) => {
    const response =
      await api.get(
        "/api/tariff-intelligence/what-if",
        {
          params: {
            tariffId,
            currentUnits,
            targetUnits,
          },
        }
      );

    return response.data;
  },
};

export default tariffIntelligenceService;