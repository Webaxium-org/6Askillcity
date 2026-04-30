import { axiosInstance } from "./axiosInstance";

export const getManagementStudents = async () => {
  const res = await axiosInstance.get("/payments/students");
  return res.data;
};

export const getGlobalPaymentStats = async () => {
  const res = await axiosInstance.get("/payments/global-stats");
  return res.data;
};

export const recordPayment = async (studentId, paymentData) => {
  const res = await axiosInstance.post(`/payments/student/${studentId}/payments`, paymentData);
  return res.data;
};

export const getStudentPayments = async (studentId) => {
  const res = await axiosInstance.get(`/payments/student/${studentId}/payments`);
  return res.data;
};

export const setPaymentSchedule = async (studentId, schedule) => {
  const res = await axiosInstance.post(`/payments/student/${studentId}/schedules`, { schedule });
  return res.data;
};

export const getStudentSchedules = async (studentId) => {
  const res = await axiosInstance.get(`/payments/student/${studentId}/schedules`);
  return res.data;
};

export const deletePaymentSchedule = async (scheduleId) => {
  const res = await axiosInstance.delete(`/payments/schedules/${scheduleId}`);
  return res.data;
};
