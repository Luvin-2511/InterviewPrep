import React, { useContext } from "react";
import { interviewContext } from "../interview.context";
import {
  setInterviewReport,
  setReportById,
  setReports,
  setResumePdf,
} from "../services/interview.api";

const useInterview = () => {
  const { loading, setloading, report, setreport, allreports, setallreports } =
    useContext(interviewContext);

  const handleInterviewReport = async ({
    jobDescription,
    resume,
    selfDescription,
  }) => {
    setloading(true);
    try {
      const response = await setInterviewReport({
        jobDescription,
        resume,
        selfDescription,
      });
      setreport(response.interviewReport);
      return response;
    } catch (err) {
      console.log(err);
    } finally {
      setloading(false);
    }
  };

  const handleReportById = async (reportId) => {
    setloading(true);
    try {
      const response = await setReportById(reportId);
      setreport(response.report);
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  const handleReports = async () => {
    setloading(true);
    try {
      const response = await setReports();
      setallreports(response.allReports);
    } catch (err) {
      console.log(err);
    } finally {
      setloading(false);
    }
  };

  const handleResumePdf = async ({ reportId }) => {
    setloading(true);
    try {
      const response = await setResumePdf({ reportId });
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return response;
    } catch (err) {
      console.log(err);
    } finally {
      setloading(false);
    }
  };

  return {
    loading,
    report,
    setreport,
    allreports,
    handleInterviewReport,
    handleReportById,
    handleReports,
    handleResumePdf,
  };
};

export default useInterview;
