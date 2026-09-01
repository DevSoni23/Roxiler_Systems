import api from "./axios";

export const getStores = (params) => {
  return api.get("/stores", { params });
};

export const addStore = (data) => {
  return api.post("/stores", data);
};

export const getOwnerDashboard = () => {
  return api.get("/stores/owner/dashboard");
};