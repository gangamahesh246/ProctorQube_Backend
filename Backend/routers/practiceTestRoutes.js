const express = require('express');
const router = express.Router();
const {
  createPracticeTest,
  getAllPracticeTests,
  getPracticeTestById,
  submitPracticeTest,
  getStudentResults
} = require('../controllers/practiceTestController');

// Create a new test (Admin)
router.post('/admin/tests', createPracticeTest);

// Get all tests
router.get('/admin/tests', getAllPracticeTests);

// Get test details (for user to attempt)
router.get('/admin/tests/:id', getPracticeTestById);

// Submit a test
router.post('/admin/tests/:id/submit', submitPracticeTest);

// Get results for a student
router.get('/admin/tests/:id/results/:studentId', getStudentResults);

module.exports = router;
