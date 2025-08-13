const mongoose = require('mongoose');

const practiceTests = new mongoose.Schema({
  technology: { type: String, required: true }, 
  questions: [
    {
      question: { type: String, required: true },
      options: { type: [String], required: true },
      correctAnswer: { type: [String], required: true },
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PracticeTests', practiceTests);
