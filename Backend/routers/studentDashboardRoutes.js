const express = require('express');
const router = express.Router();

const { getStudentDashboard } = require('../controllers/studentDashboardController');
const { protect } = require('../middlewares/authMiddleware'); // ✅ correctly importing 'protect'

router.get('/dashboard', protect, getStudentDashboard); // ✅ using the correct middleware function

module.exports = router;
