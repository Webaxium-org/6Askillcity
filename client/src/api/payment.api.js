import axios from "axios";

const API_URL = `${import.meta.env.VITE_BASE_URL || "http://localhost:4040"}/api/payments`;

export const getManagementStudents = async () => {
  const res = await axios.get(`${API_URL}/students`, { withCredentials: true });
  return res.data;
};

export const getGlobalPaymentStats = async () => {
  const res = await axios.get(`${API_URL}/global-stats`, { withCredentials: true });
  return res.data;
};

export const recordPayment = async (studentId, paymentData) => {
  const res = await axios.post(`${API_URL}/student/${studentId}/payments`, paymentData, { withCredentials: true });
  return res.data;
};

export const getStudentPayments = async (studentId) => {
  const res = await axios.get(`${API_URL}/student/${studentId}/payments`, { withCredentials: true });
  return res.data;
};

export const setPaymentSchedule = async (studentId, schedule) => {
  const res = await axios.post(`${API_URL}/student/${studentId}/schedules`, { schedule }, { withCredentials: true });
  return res.data;
};

export const getStudentSchedules = async (studentId) => {
  const res = await axios.get(`${API_URL}/student/${studentId}/schedules`, { withCredentials: true });
  return res.data;
};

export const deletePaymentSchedule = async (scheduleId) => {
  const res = await axios.delete(`${API_URL}/schedules/${scheduleId}`, { withCredentials: true });
  return res.data;
};
