const mongoose = require("mongoose");

const timeTrackSchema = new mongoose.Schema(
  {
    questionNo: { type: Number, required: true },
    timeSpent: { type: Number, required: true }, 
  },
  { _id: false } 
);

const examStatsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String },
    totalMarks: { type: Number, required: true },
    passMark: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number },
    score: { type: Number, default: null },
    attemptStart: { type: Date, required: true },
    attemptEnd: { type: Date, required: true },
    timeTrack: [timeTrackSchema],
  },
  { _id: false }
);

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
  stats: examStatsSchema 
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
