const mongoose = require('mongoose');

// Sub-schema for individual question
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true }
});

// Sub-schema for each student's answers and result
const studentResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [
    {
      question: String,
      selectedAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean
    }
  ],
  score: Number,
  startedAt: Date,
  endedAt: Date
});

const practiceTestFullSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  questions: [questionSchema],
  results: [studentResultSchema], // Embedded student submissions
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PracticeTestFull', practiceTestFullSchema);
