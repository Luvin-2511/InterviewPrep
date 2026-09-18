const mongoose = require("mongoose");

const behavioralQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "This field is required !"],
    },
    intention: {
      type: String,
      required: [true, "This field is required !"],
    },
    answer: {
      type: String,
      required: [true, "This field is required !"],
    },
  },
  {
    _id: false,
  },
);

const technicalQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "This field is required !"],
    },
    intention: {
      type: String,
      required: [true, "This field is required !"],
    },
    answer: {
      type: String,
      required: [true, "This field is required !"],
    },
  },
  {
    _id: false,
  },
);

const skillGapSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: [true, "This field is required !"],
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: [true, "This field is required !"],
    },
  },
  { _id: false },
);

const preparationPlanSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, "This field is required !"],
    },
    focus: {
      type: String,
      required: [true, "This field is required !"],
    },
    tasks: [
      {
        type: String,
        required: [true, "This field is required !"],
      },
    ],
  },
  { _id: false },
);

const interviewReportSchema = new mongoose.Schema(
  {
    jobDescription: {
      type: String,
      required: [true, "Job Description is required !"],
    },
    resume: {
      type: String,
    },
    selfDescription: {
      type: String,
      required: [true, "Self Description is required !"],
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    behavioralQuestions: [behavioralQuestionSchema],
    technicalQuestions: [technicalQuestionSchema],
    skillGap: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    title:String,
    user:{
      type:mongoose.Schema.Types.ObjectId,
      required:true
    }
  },
  {
    timestamps: true,
  },
);

const interviewReportModel = mongoose.model(
  "interviewReport",
  interviewReportSchema,
);

module.exports = interviewReportModel;
