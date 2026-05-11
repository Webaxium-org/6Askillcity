import { axiosInstance } from "./axiosInstance";

export const getServiceDashboardStats = async () => {
  const response = await axiosInstance.get("/services/dashboard-stats");
  return response.data;
};

export const createServiceDefinition = async (data) => {
  const response = await axiosInstance.post("/services/definitions", data);
  return response.data;
};

export const getServiceDefinitions = async () => {
  const response = await axiosInstance.get("/services/definitions");
  return response.data;
};

export const updateServiceFee = async (id, data) => {
  const response = await axiosInstance.put(`/services/definitions/${id}/fee`, data);
  return response.data;
};

export const updateServiceDefinition = async (id, data) => {
  const response = await axiosInstance.put(`/services/definitions/${id}`, data);
  return response.data;
};

export const applyForService = async (data) => {
  const response = await axiosInstance.post("/services/apply", data);
  return response.data;
};

export const getServiceApplications = async (params) => {
  const response = await axiosInstance.get("/services/applications", { params });
  return response.data;
};

export const updateApplicationStatus = async (id, data) => {
  const response = await axiosInstance.put(`/services/applications/${id}/status`, data);
  return response.data;
};

export const recordServicePayment = async (id, data) => {
  const response = await axiosInstance.put(`/services/applications/${id}/pay`, data);
  return response.data;
};
