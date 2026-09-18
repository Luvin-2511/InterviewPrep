const mongoose = require("mongoose");

const toStringSetter = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return JSON.stringify(val, null, 2);
  return String(val);
};

const behavioralQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "This field is required !"],
      set: toStringSetter,
    },
    intention: {
      type: String,
      required: [true, "This field is required !"],
      set: toStringSetter,
    },
    answer: {
      type: String,
      required: [true, "This field is required !"],
      set: toStringSetter,
    },
  },
  {
    _id: false,
  }
);

const technicalQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "This field is required !"],
      set: toStringSetter,
    },
    intention: {
      type: String,
      required: [true, "This field is required !"],
      set: toStringSetter,
    },
    answer: {
      type: String,
      required: [true, "This field is required !"],
      set: toStringSetter,
    },
  },
  {
    _id: false,
  }
);

const skillGapSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: [true, "This field is required !"],
      set: toStringSetter,
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
  },
  { _id: false }
);

const preparationPlanSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, "This field is required !"],
      set: toStringSetter,
    },
    focus: {
      type: String,
      required: [true, "This field is required !"],
      set: toStringSetter,
    },
    tasks: [
      {
        type: String,
        set: toStringSetter,
      },
    ],
  },
  { _id: false }
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
      default: 75,
    },
    behavioralQuestions: [behavioralQuestionSchema],
    technicalQuestions: [technicalQuestionSchema],
    skillGap: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    title: {
      type: String,
      default: "Interview Preparation Plan",
      set: toStringSetter,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const interviewReportModel = mongoose.model(
  "interviewReport",
  interviewReportSchema
);

module.exports = interviewReportModel;
