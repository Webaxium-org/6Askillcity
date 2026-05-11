import { axiosInstance } from "./axiosInstance";

// Partner: Create a draft application
export const registerStudent = async (formData) => {
  const response = await axiosInstance.post("/students/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Partner: Fetch all my applications
export const getMyApplications = async () => {
  const response = await axiosInstance.get("/students/my-applications");
  return response.data;
};

// Shared: Get a single application/student by ID
export const getApplicationById = async (id) => {
  const response = await axiosInstance.get(`/students/${id}`);
  return response.data;
};

export const getStudentById = getApplicationById;

// Partner: Edit a draft/rejected application
export const updateApplication = async (id, formData) => {
  const response = await axiosInstance.put(`/students/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Partner: Submit (or re-submit) for eligibility
export const submitApplication = async (id) => {
  const response = await axiosInstance.post(`/students/${id}/submit`);
  return response.data;
};

// Admin: Get all pending-eligibility applications
export const getPendingEligibility = async () => {
  const response = await axiosInstance.get("/students/pending-eligibility");
  return response.data;
};

// Admin: Approve or reject an application
export const reviewApplication = async (id, action, admin_remarks = "") => {
  const response = await axiosInstance.patch(`/students/${id}/review`, {
    action,
    admin_remarks,
  });
  return response.data;
};

// Update student lifecycle status (On Progress, Enrolled, Cancelled)
export const updateStudentStatus = async (id, status, enrollmentNumber = "") => {
  const response = await axiosInstance.patch(`/students/${id}/status`, {
    status,
    enrollmentNumber,
  });
  return response.data;
};

// ── Followup API ───────────────────────────────────────────────

export const getFollowups = async (studentId, page = 1) => {
  const response = await axiosInstance.get(`/followups/${studentId}`, {
    params: { page, limit: 20 },
  });
  return response.data;
};

export const addFollowup = async (studentId, note, category = "general", nextFollowupDate = null, status = "") => {
  const response = await axiosInstance.post(`/followups/${studentId}`, {
    note,
    category,
    nextFollowupDate,
    status,
  });
  return response.data;
};

export const deleteFollowup = async (followupId) => {
  const response = await axiosInstance.delete(`/followups/entry/${followupId}`);
  return response.data;
};
