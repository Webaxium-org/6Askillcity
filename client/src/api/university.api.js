import { axiosInstance } from "./axiosInstance";

export const getUniversities = async () => {
  const response = await axiosInstance.get("/university-management/universities");
  return response.data;
};

export const createUniversity = async (data) => {
  const response = await axiosInstance.post("/university-management/universities", data);
  return response.data;
};

export const updateUniversity = async (id, data) => {
  const response = await axiosInstance.put(`/university-management/universities/${id}`, data);
  return response.data;
};

export const getPrograms = async (universityId) => {
  const response = await axiosInstance.get("/university-management/programs", {
    params: { universityId },
  });
  return response.data;
};

export const createProgram = async (data) => {
  const response = await axiosInstance.post("/university-management/programs", data);
  return response.data;
};

export const updateProgram = async (id, data) => {
  const response = await axiosInstance.put(`/university-management/programs/${id}`, data);
  return response.data;
};

export const getProgramFees = async (programId) => {
  const response = await axiosInstance.get(`/university-management/programs/${programId}/fees`);
  return response.data;
};

export const updateProgramFee = async (programId, data) => {
  const response = await axiosInstance.post(`/university-management/programs/${programId}/fees`, data);
  return response.data;
};

export const getActivityLogs = async () => {
  const response = await axiosInstance.get("/university-management/activity-logs");
  return response.data;
};
