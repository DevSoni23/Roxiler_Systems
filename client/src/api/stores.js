import api from "./axios";

export const getStores = (params = {}) => {
  return api.get("/stores", { params });
};