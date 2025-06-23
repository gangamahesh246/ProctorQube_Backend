const express = require('express');
const Route = express.Router();
const multer = require("multer");
const upload = require('../middleware/Upload');
const { postExam, GetExam, UpdateExam, getExamById, deleteExam, getExamQuestionsById } = require('../controllers/ExamController');
const { protect, adminOnly } = require("../middleware/authMiddleware");


const handleFileUpload = (req, res, next) => {
  upload.single("coverPreview")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "File size should not exceed 2MB" });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err });
    }
    next();
  });
};

Route.post('/postexam', protect, adminOnly, handleFileUpload, postExam);
Route.get('/getexam', protect, adminOnly, GetExam);
Route.get('/getexam/:examId', protect, getExamById);
Route.get('/getexamquestions/:examId', protect, adminOnly, getExamQuestionsById);
Route.put('/updateexam/:examId', protect, adminOnly, UpdateExam);
Route.delete('/deleteexam/:examId', protect, adminOnly, deleteExam);

module.exports = Route;