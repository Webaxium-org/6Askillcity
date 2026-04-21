import { axiosInstance } from "./axiosInstance";

export const registerStudent = async (formData) => {
  const response = await axiosInstance.post("/students/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
