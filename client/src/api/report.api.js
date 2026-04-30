import { axiosInstance } from "./axiosInstance";

export const getAcademicReport = async (groupBy) => {
  const res = await axiosInstance.get(`/reports/academic?groupBy=${groupBy}`);
  return res.data;
};

export const getAdmissionReport = async (type, options = {}) => {
  const { startDate, endDate } = options;
  let url = `/reports/admission?type=${type}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  
  const res = await axiosInstance.get(url);
  return res.data;
};

export const getDocumentReport = async (docType) => {
  const res = await axiosInstance.get(`/reports/documents?docType=${docType}`);
  return res.data;
};

export const getFinancialReport = async () => {
  const res = await axiosInstance.get("/reports/financial");
  return res.data;
};

export const getFeeWiseReport = async () => {
  const res = await axiosInstance.get("/reports/fee-wise");
  return res.data;
};
