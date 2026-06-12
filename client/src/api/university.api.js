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

export const deleteProgram = async (id) => {
  const response = await axiosInstance.delete(`/university-management/programs/${id}`);
  return response.data;
};

export const getBranches = async (programId) => {
  const response = await axiosInstance.get("/university-management/branches", {
    params: { programId },
  });
  return response.data;
};

export const createBranch = async (data) => {
  const response = await axiosInstance.post("/university-management/branches", data);
  return response.data;
};

export const updateBranch = async (id, data) => {
  const response = await axiosInstance.put(`/university-management/branches/${id}`, data);
  return response.data;
};

export const deleteBranch = async (id) => {
  const response = await axiosInstance.delete(`/university-management/branches/${id}`);
  return response.data;
};

export const getProgramFees = async (branchId) => {
  const response = await axiosInstance.get(`/university-management/branches/${branchId}/fees`);
  return response.data;
};

export const updateProgramFee = async (branchId, data) => {
  const response = await axiosInstance.post(`/university-management/branches/${branchId}/fees`, data);
  return response.data;
};

export const getActivityLogs = async () => {
  const response = await axiosInstance.get("/university-management/activity-logs");
  return response.data;
};

export const importUniversityExcel = async (universityId, file, programType, mode) => {
  const formData = new FormData();
  formData.append("universityId", universityId);
  formData.append("file", file);
  if (programType) formData.append("programType", programType);
  if (mode) formData.append("mode", mode);
  const response = await axiosInstance.post("/university-management/universities/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getPublicPrograms = async (params) => {
  const response = await axiosInstance.get("/university-management/public/programs", { params });
  return response.data;
};

export const getPublicBranches = async (programId) => {
  const response = await axiosInstance.get("/university-management/public/branches", {
    params: { programId },
  });
  return response.data;
};
