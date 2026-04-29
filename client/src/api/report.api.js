import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getAcademicReport = async (groupBy) => {
  const res = await axios.get(`${API_URL}/reports/academic?groupBy=${groupBy}`, {
    withCredentials: true,
  });
  return res.data;
};

export const getAdmissionReport = async (type, options = {}) => {
  const { startDate, endDate } = options;
  let url = `${API_URL}/reports/admission?type=${type}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  
  const res = await axios.get(url, {
    withCredentials: true,
  });
  return res.data;
};

export const getDocumentReport = async (docType) => {
  const res = await axios.get(`${API_URL}/reports/documents?docType=${docType}`, {
    withCredentials: true,
  });
  return res.data;
};

export const getFinancialReport = async () => {
  const res = await axios.get(`${API_URL}/reports/financial`, {
    withCredentials: true,
  });
  return res.data;
};

export const getFeeWiseReport = async () => {
  const res = await axios.get(`${API_URL}/reports/fee-wise`, {
    withCredentials: true,
  });
  return res.data;
};
