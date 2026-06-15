import { axiosInstance as API } from "./axiosInstance";

export const getPartnerDashboardStats = async (year, half) => {
  const response = await API.get(`/admission-points/stats?year=${year}&half=${half}`);
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

export const getPermittedCourses = async () => {
  const response = await API.get("/admission-points/permitted-courses");
  return response.data;
};

export const reviewPartner = async (id, status) => {
  const response = await API.patch(`/admission-points/${id}/status`, { status });
  return response.data;
};

export const generateAdminToken = async (id) => {
  const response = await API.post(`/admission-points/${id}/generate-token`);
  return response.data;
};

export const createInspectionFeeOrder = async () => {
  const response = await API.post("/admission-points/onboarding/fee-order");
  return response.data;
};

export const verifyInspectionFeePayment = async (orderId) => {
  const response = await API.post("/admission-points/onboarding/verify-fee", { orderId });
  return response.data;
};

export const completePartnerInspection = async (id) => {
  const response = await API.patch(`/admission-points/${id}/complete-inspection`);
  return response.data;
};

export const recordOfflineInspectionFee = async (formData) => {
  const response = await API.post("/admission-points/onboarding/offline-fee", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const uploadInspectionMedia = async (formData) => {
  const response = await API.post("/admission-points/onboarding/office-video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const rejectPartnerInspection = async (id, reason) => {
  const response = await API.put(`/admission-points/${id}/reject-inspection`, { reason });
  return response.data;
};

export const renewPartnerAuthorisation = async (id) => {
  const response = await API.post(`/admission-points/${id}/renew-authorisation`);
  return response.data;
};

