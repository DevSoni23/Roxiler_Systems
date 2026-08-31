import api from "./axios";

export const submitRating = (data) => {
  return api.post("/ratings", data);
};