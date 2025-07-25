const express = require('express');
const router = express.Router();

const {
  getInterviewQuestionsByTechnology,
  PostOrUpdateInterviewQuestions
} = require('../controllers/interviewQuestionController');

router.get('/interview-questions', getInterviewQuestionsByTechnology);
router.post('/upload/interview-questions', PostOrUpdateInterviewQuestions); 

module.exports = router;
