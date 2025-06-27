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
} = require("../middlewares/authMiddleware");

router.post("/assign", protect, adminOnly, assignExamToStudent);

router.get("/student", protect, getStudentExams);

router.put("/complete", updateExamStatus);

module.exports = router;
