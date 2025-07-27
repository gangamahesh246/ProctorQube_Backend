const express = require('express');
const router = express.Router();
const {
  getPracticeQuestionsByTechnology,
  postOrUpdatePracticeQuestions
} = require('../controllers/practiceTestController');
const { protectStudent, protectAdmin } = require('../middlewares/authMiddleware');


router.get('/practice-tests', protectStudent, getPracticeQuestionsByTechnology);
router.post('/upload-practice-questions', protectAdmin, postOrUpdatePracticeQuestions); 

module.exports = router;
