import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getPartners = async (params = {}) => {
  const res = await axios.get(`${API_URL}/admission-points`, { 
    params,
    withCredentials: true 
  });
  return res.data;
};

export const getPartnerById = async (id) => {
  const res = await axios.get(`${API_URL}/admission-points/${id}`, { withCredentials: true });
  return res.data;
};

export const updatePartnerStatus = async (id, status) => {
  const res = await axios.patch(`${API_URL}/admission-points/${id}/status`, { status }, { withCredentials: true });
  return res.data;
};

export const togglePartnerActive = async (id, isActive) => {
  const res = await axios.patch(`${API_URL}/admission-points/${id}/toggle-active`, { isActive }, { withCredentials: true });
  return res.data;
};

export const getPartnerPermissions = async (partnerId) => {
  const res = await axios.get(`${API_URL}/admission-points/${partnerId}/permissions`, { withCredentials: true });
  return res.data;
};

export const addPartnerPermission = async (data) => {
  const res = await axios.post(`${API_URL}/admission-points/permissions`, data, { withCredentials: true });
  return res.data;
};

export const removePartnerPermission = async (id) => {
  const res = await axios.delete(`${API_URL}/admission-points/permissions/${id}`, { withCredentials: true });
  return res.data;
};
