const mongoose = require("mongoose");

const studentScoreSchema = new mongoose.Schema({
  examId: { type: String, required: true },
  student_mail: { type: String, required: true },
  totalMarks: { type: String },
  score: { type: Number },
  correct: { type: Number },
  incorrect: { type: Number },
  violations: { type: Number },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StudentScore", studentScoreSchema);
