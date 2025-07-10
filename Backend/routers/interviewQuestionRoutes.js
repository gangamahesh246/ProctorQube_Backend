const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

const {
  addInterviewQuestion,
  getAllInterviewQuestions,
  bulkUploadQuestions
} = require('../controllers/interviewQuestionController');

router.post('/admin/interview-questions', addInterviewQuestion);
router.get('/admin/interview-questions', getAllInterviewQuestions);
router.post('/admin/upload', upload.single('file'), bulkUploadQuestions); // Upload Excel

module.exports = router;
