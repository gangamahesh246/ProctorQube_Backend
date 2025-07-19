const mongoose = require("mongoose");

const examStatsSchema = new mongoose.Schema(
  {
    title: { type: String },
    subject: { type: String },
    totalMarks: { type: Number },
    passMark: { type: Number },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number },
    score: { type: Number, default: null },
    attemptStart: { type: Date },
    attemptEnd: { type: Date },
    violations: {
      tabSwitchingViolation: { type: Number, default: 0 },
      devtoolsViolation: { type: Number, default: 0 },
      rightClickViolation: { type: Number, default: 0 },
      webcamViolation: { type: Number, default: 0 },
      soundViolation: { type: Number, default: 0 },
      fullscreenViolation: { type: Number, default: 0 },
    },
    violationPhotos: { type: [String], default: [] },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    score: { type: Number, default: null },
    result: { type: String, enum: ["pass", "fail", "NA"], default: "NA" },
    attemptStart: { type: Date },
    attemptEnd: { type: Date },
    stats: examStatsSchema,
  },
  { _id: false }
);

const examEntrySchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },

  status: { type: String },
  ranking: { type: Number },
  timeTaken: { type: Number },
  assignedBy: { type: String },
  assignedAt: { type: Date, default: Date.now },

  attempts: [attemptSchema],
});

const studentExamSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  exams: [examEntrySchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StudentExam", studentExamSchema);
