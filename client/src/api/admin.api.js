import { axiosInstance } from "./axiosInstance";

export const getAdminDashboardStats = async () => {
  const response = await axiosInstance.get("/admin/stats");
  return response.data;
};
