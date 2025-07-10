const express = require('express');
const router = express.Router();

const { getStudentDashboard } = require('../controllers/studentDashboardController');
const { protectStudent } = require('../middlewares/authMiddleware'); 

router.get('/dashboard', protectStudent, getStudentDashboard); 

module.exports = router;
