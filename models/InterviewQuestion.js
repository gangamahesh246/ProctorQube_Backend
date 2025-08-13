const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema({
  technology: { type: String, required: true },
  questions: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
      explanation: { type: String }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InterviewQuestion', interviewQuestionSchema);
