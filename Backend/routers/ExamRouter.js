const express = require('express');
const Route = express.Router();
const { upload } = require('../utils/s3upload');
const { postExam, GetExam, UpdateExam, getExamById, deleteExam, getExamQuestionsById } = require('../controllers/ExamController');
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { postExam, GetExam, UpdateExam, getExamById, deleteExam, getExamQuestionsById, getExamInstructions } = require('../controllers/ExamController');
const { protect, adminOnly } = require("../middleware/authMiddleware");

Route.post('/postexam', protect, adminOnly, upload.single("coverPreview"), postExam);
Route.get('/getexam', protect, adminOnly, GetExam);
Route.get('/getexam/:examId', protect, getExamById);
Route.get('/getexaminstructions/:examId', protect, getExamInstructions);
Route.get('/getexamquestions/:examId', protect, adminOnly, getExamQuestionsById);
Route.put('/updateexam/:examId', protect, adminOnly, UpdateExam);
Route.delete('/deleteexam/:examId', protect, adminOnly, deleteExam);

module.exports = Route;