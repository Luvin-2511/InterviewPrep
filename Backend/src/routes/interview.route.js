const { Router } = require("express");
const authUser = require("../middlewares/auth.middleware");
const {
  interviewController,
  interviewReportByIdController,
  convertResumeToPdfController,
  interviewReportsController,
} = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");
const interviewRouter = Router();

interviewRouter.post(
  "/",
  authUser,
  upload.single("resume"),
  interviewController,
);
interviewRouter.get(
    "/report/:reportId",
    authUser,
    interviewReportByIdController,
);
interviewRouter.get("/reports", authUser, interviewReportsController);
interviewRouter.post(
  "/resume-pdf/:reportId",
  authUser,
  convertResumeToPdfController,
);

module.exports = interviewRouter;
