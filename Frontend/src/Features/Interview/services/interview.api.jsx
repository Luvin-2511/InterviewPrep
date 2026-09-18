import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
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
  }
};

export const setReportById = async (reportId) => {
  try {
    const response = await api.get(`/api/interview/report/${reportId}`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const setReports = async () => {
  try {
    const response = await api.get("/api/interview/reports");
    return response.data;
  } catch (error) {
    console.log(error);
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
  }
};
