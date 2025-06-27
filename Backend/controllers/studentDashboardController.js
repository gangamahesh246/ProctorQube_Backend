const mongoose = require('mongoose');
const StudentExam = require('../models/StudentExam'); // Still your unified model

const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1. Fetch student exam record
    const studentExam = await StudentExam.findOne({ student_id: studentId });

    if (!studentExam || studentExam.exams.length === 0) {
      return res.json({
        summary: {
          examsAssigned: 0,
          examsCompleted: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          nextExam: null
        },
        scoreTrend: [],
        categoryPerformance: [],
        timePerQuestion: []
      });
    }

    // Filter completed exams with stats
    const completedExams = studentExam.exams.filter(exam => exam.status === 'completed' && exam.stats);

    const examsCompleted = completedExams.length;
    const scores = completedExams.map(exam => exam.stats.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // 2. Score Trend (last 5 attempts)
    const scoreTrend = completedExams
      .sort((a, b) => new Date(a.stats.attemptEnd) - new Date(b.stats.attemptEnd))
      .slice(-5)
      .map(exam => ({
        date: exam.stats.attemptEnd.toISOString().split('T')[0],
        score: exam.stats.score
      }));

    // 3. Category-wise performance
    const categoryMap = {};
    completedExams.forEach(exam => {
      const subject = exam.stats.subject || 'General';
      if (!categoryMap[subject]) categoryMap[subject] = [];
      categoryMap[subject].push(exam.stats.score);
    });

    const categoryPerformance = Object.entries(categoryMap).map(([category, scores]) => ({
      category,
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }));

    // 4. Time Per Question
    const timePerQuestion = completedExams.map(exam => ({
      examTitle: exam.stats.title,
      questionStats: exam.stats.timeTrack
    }));

    // 5. Upcoming exam logic placeholder (you can link with Exam collection)
    const nextExam = null;

    res.json({
      summary: {
        examsAssigned: studentExam.exams.length,
        examsCompleted,
        averageScore: Number(averageScore.toFixed(2)),
        highestScore,
        lowestScore,
        nextExam
      },
      scoreTrend,
      categoryPerformance,
      timePerQuestion
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: 'Failed to load student dashboard' });
  }
};

module.exports = { getStudentDashboard };
