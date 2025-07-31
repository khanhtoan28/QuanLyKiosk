import axios from "axios";

const BASE_URL = "http://localhost:5000/api/kiosk-plans";

export const getAllPlans = () => axios.get(BASE_URL);
export const getPlanById = (id) => axios.get(`${BASE_URL}/${id}`);
export const createPlan = (data) => axios.post(BASE_URL, data);
export const updatePlanById = (id, data) => axios.put(`${BASE_URL}/${id}`, data);
export const deletePlan = (id) => axios.delete(`${BASE_URL}/${id}`);
export const importExcel = (formData) =>
  axios.post(`${BASE_URL}/import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

const kioskPlanApi = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlanById,
  deletePlan,
  importExcel,
};

export default kioskPlanApi;
