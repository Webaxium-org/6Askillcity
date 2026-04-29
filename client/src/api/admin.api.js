import { axiosInstance } from "./axiosInstance";

export const getAdminDashboardStats = async (year, half) => {
  const response = await axiosInstance.get(`/admin/stats?year=${year}&half=${half}`);
  return response.data;
};
