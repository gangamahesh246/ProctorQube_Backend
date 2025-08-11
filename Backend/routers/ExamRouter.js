const express = require('express');
const Route = express.Router();
const { upload } = require('../utils/s3upload');
const { postExam, GetExam, UpdateExam, getExamById, deleteExam, getExamQuestionsById, getExamInstructions, getSpecificUsers } = require('../controllers/ExamController');
const { protectAdmin, protectStudent } = require("../middlewares/authMiddleware");

Route.post('/postexam', protectAdmin, upload.single("coverPreview"), postExam);
Route.get('/getexam', protectAdmin, GetExam);
Route.get('/getexam/:examId', getExamById);
Route.get('/getexamdetails', protectAdmin, getSpecificUsers);
Route.get('/getexaminstructions/:examId', protectStudent, getExamInstructions);
Route.get('/getexamquestions/:examId', getExamQuestionsById);
Route.put('/updateexam/:examId', protectAdmin, UpdateExam);
Route.delete('/deleteexam/:examId', protectAdmin, deleteExam);

module.exports = Route;x