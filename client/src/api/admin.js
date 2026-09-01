import api from "./axios";

export const getDashboardStats = () => {
  return api.get("/admin/dashboard");
};

export const getUsers = (params = {}) => {
  return api.get("/admin/users", { params });
};

export const addUser = (data) => {
  return api.post("/admin/users", data);
};

export const getStoreOwners = () => {
  return api.get("/admin/store-owners");
};

export const addStore = (data) => {
  return api.post("/admin/stores", data);
};