import { axiosInstance } from "./axiosInstance";

export const loginUser = async (formData) => {
  const response = await axiosInstance.post("/auth/login/user", formData);
  return response.data;
};

export const loginAdmissionPoint = async (formData) => {
  const response = await axiosInstance.post(
    "/auth/login/admission-point",
    formData,
  );
  return response.data;
};
