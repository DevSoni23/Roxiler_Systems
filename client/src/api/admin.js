import api from "./axios";

export const getDashboardStats = () => api.get("/admin/dashboard");
export const getUsers  = (params = {}) => api.get("/admin/users",  { params });
export const addUser   = (data)         => api.post("/admin/users", data);
export const deleteUser = (id)          => api.delete(`/admin/users/${id}`);

export const getStoreOwners = () => api.get("/admin/store-owners");
export const getAdminStores = (params = {}) => api.get("/admin/stores", { params });
export const addStore    = (data) => api.post("/admin/stores",    data);
export const deleteStore = (id)   => api.delete(`/admin/stores/${id}`);