import api from "../api/axios";

/**
 * Appliance categories (Cooling, Kitchen, Lighting, Entertainment,
 * Washing, Heating). Read-only for household users — they fill the
 * category dropdown on the appliance form.
 *
 * CONFIRM AGAINST: ApplianceCategoryController.java
 */
const ENDPOINTS = {
  list: "/api/appliance-categories",
};

export const categoryService = {
  list: () => api.get(ENDPOINTS.list).then((r) => r.data),
};

export default categoryService;
