import { axiosInstance } from "./axiosInstance";

export const registerAdmissionPoint = async (formData) => {
  const response = await axiosInstance.post("/admission-points/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getPendingAdmissionPoints = async () => {
  const response = await axiosInstance.get("/admission-points/pending");
  return response.data;
};

export const getAllApprovedAdmissionPoints = async () => {
  const response = await axiosInstance.get("/admission-points/approved");
  return response.data;
};

export const updateAdmissionPointStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/admission-points/${id}/status`, { status });
  return response.data;
};

