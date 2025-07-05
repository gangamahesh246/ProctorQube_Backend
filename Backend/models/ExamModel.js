const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  status: { type: String},
  basicInfo: {
    title: { type: String, required: true },
    category: { type: String, required: true },
    coverPreview: { type: String, default: "/exam.jpg" },
    description: { type: String },
  },
  questions: [
    {
      question: String,
      options: [String],
      correct: [String],
      marks: Number,
    }
  ],

  settings: {
    availability: {
      timeLimitDays: {
        from: { type: String },
        to: { type: String },
      },
      timeLimitHours: {
        from: { type: String }, 
        to: { type: String }, 
      },
      lateTime: { type: String },
    },
    examTakenTimes: {
      type: {
        type: String,
      },
      multiple: { type: Number },
    },
    answerTimeControl: {
      type: {
        type: String,
      },
      examTime: { type: Number }, 
      questionTime: { type: Number },
    },
    assignExamTo: {
      specificUsers: [],
    },
    results: {
      displayScore: {
        enabled: { type: Boolean },
        passPercentage: { type: Number },
        negativeMarking: { type: Number },
      },
    }, 
    antiCheating: {
      switchingScreen: { type: Number },
      interruptionExceeds: { type: Boolean },
      copyPastePrevention: { type: Boolean },
      forceFullscreen: { type: Boolean },
      webcam: { type: Boolean },
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);
