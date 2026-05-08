import { axiosInstance } from "./axiosInstance";

/**
 * Fetch notifications with optional pagination and filter
 * @param {object} params - { page, limit, filter: "all"|"unread"|"read" }
 */
export const fetchNotificationsApi = async ({ page = 1, limit = 50, filter = "all" } = {}) => {
  const params = { page, limit };
  if (filter && filter !== "all") params.filter = filter;
  const res = await axiosInstance.get("/notifications", { params });
  return res.data;
};

export const getUnreadCountApi = async () => {
  const res = await axiosInstance.get("/notifications/count");
  return res.data;
};

export const markAsReadApi = async (id) => {
  const res = await axiosInstance.put(`/notifications/${id}/read`);
  return res.data;
};

export const markAllAsReadApi = async () => {
  const res = await axiosInstance.put("/notifications/read-all");
  return res.data;
};

export const deleteNotificationApi = async (id) => {
  const res = await axiosInstance.delete(`/notifications/${id}`);
  return res.data;
};

export const clearAllNotificationsApi = async () => {
  const res = await axiosInstance.delete("/notifications/clear-all");
  return res.data;
};
