const express = require('express');
const router = express.Router();

const {
  getInterviewQuestionsByTechnology,
  PostOrUpdateInterviewQuestions
} = require('../controllers/interviewQuestionController');
const { protectStudent, protectAdmin } = require('../middlewares/authMiddleware');


router.get('/interview-questions', protectStudent, getInterviewQuestionsByTechnology);
router.post('/upload/interview-questions', protectAdmin, PostOrUpdateInterviewQuestions); 

module.exports = router;
