import { axiosInstance as API } from "./axiosInstance";

export const getPartnerDashboardStats = async () => {
  const response = await API.get("/admission-points/stats");
  return response.data;
};

export const getMyProfile = async () => {
  const response = await API.get("/admission-points/profile/me");
  return response.data;
};

export const getPartners = async (params) => {
  const response = await API.get("/admission-points", { params });
  return response.data;
};

export const getPartnerById = async (id) => {
  const response = await API.get(`/admission-points/${id}`);
  return response.data;
};

export const togglePartnerActive = async (id, isActive) => {
  const response = await API.patch(`/admission-points/${id}/toggle-active`, { isActive });
  return response.data;
};

export const getPartnerPermissions = async (partnerId) => {
  const response = await API.get(`/admission-points/${partnerId}/permissions`);
  return response.data;
};

export const addPartnerPermission = async (data) => {
  const response = await API.post("/admission-points/permissions", data);
  return response.data;
};

export const removePartnerPermission = async (id) => {
  const response = await API.delete(`/admission-points/permissions/${id}`);
  return response.data;
};
