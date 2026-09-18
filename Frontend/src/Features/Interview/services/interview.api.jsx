import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setInterviewReport = async ({
  resume,
  jobDescription,
  selfDescription,
}) => {
  try {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resume);

    const response = await api.post("/api/interview", formData);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const setReportById = async (reportId) => {
  try {
    const response = await api.get(`/api/interview/report/${reportId}`);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const setReports = async () => {
  try {
    const response = await api.get("/api/interview/reports");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const setResumePdf = async ({ reportId }) => {
  try {
    const response = await api.post(
      `/api/interview/resume-pdf/${reportId}`,
      {},
      { responseType: "arraybuffer" },
    );
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
