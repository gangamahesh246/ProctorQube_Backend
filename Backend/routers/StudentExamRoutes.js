const express = require("express");
const router = express.Router();
const {
  assignExamToStudent,
  getStudentExams,
  updateExamStatus,
} = require("../controllers/StudentExamController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

router.post("/assign", protect, adminOnly, assignExamToStudent);

router.get("/student", protect, getStudentExams);

router.put("/complete", protect, updateExamStatus);

module.exports = router;
