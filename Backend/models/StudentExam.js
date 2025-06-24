const mongoose = require("mongoose");

const examEntrySchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  status: {
    type: String,
    enum: ["assigned", "completed"],
    default: "assigned",
  },
  result: { type: String, enum: ["pass", "fail", "NA"], default: "NA" },
  score: { type: Number, default: null },
  assignedBy: { type: String },
  assignedAt: { type: Date, default: Date.now },
});

const studentExamSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    unique: true,
  },
  exams: [examEntrySchema],
});

module.exports = mongoose.model("StudentExam", studentExamSchema);
