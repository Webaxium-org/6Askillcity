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

export const getAllUsers = async () => {
  const response = await axiosInstance.get("/auth/users");
  return response.data;
};

export const forgotPasswordAPI = async (data) => {
  const response = await axiosInstance.post("/auth/forgot-password", data);
  return response.data;
};

export const verifyOtpAPI = async (data) => {
  const response = await axiosInstance.post("/auth/verify-otp", data);
  return response.data;
};

export const resetPasswordAPI = async (data) => {
  const response = await axiosInstance.post("/auth/reset-password", data);
  return response.data;
};
