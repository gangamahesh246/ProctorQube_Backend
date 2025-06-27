const mongoose = require("mongoose");

// Subdocument schema for per-question time tracking
const timeTrackSchema = new mongoose.Schema(
  {
    questionNo: { type: Number, required: true },
    timeSpent: { type: Number, required: true }, // in seconds
  },
  { _id: false } // prevent automatic _id for each subdocument
);

// Embedded exam statistics schema (attempt details)
const examStatsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String },
    totalMarks: { type: Number, required: true },
    passMark: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number },
    score: { type: Number, required: true },
    attemptStart: { type: Date, required: true },
    attemptEnd: { type: Date, required: true },
    timeTrack: [timeTrackSchema],
  },
  { _id: false }
);

// Schema for each exam entry assigned to the student
const examEntrySchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  status: {
    type: String,
  },
  result: {
    type: String,
    enum: ["pass", "fail", "NA"],
    default: "NA",
  },
  score: { type: Number, default: null },
  ranking: { type: Number },
  startingTime: { type: String },
  closingTime: { type: String },
  timeTaken: { type: Number }, 
  score: { type: Number },
  assignedBy: { type: String },
  assignedAt: { type: Date, default: Date.now },
  stats: examStatsSchema // Embedded exam attempt details
});

// Main student exam schema
const studentExamSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Change to "Student" if that matches your user model
    required: true,
    unique: true,
  },
  exams: [examEntrySchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StudentExam", studentExamSchema);
