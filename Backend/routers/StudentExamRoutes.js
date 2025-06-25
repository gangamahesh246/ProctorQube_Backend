const express = require("express");
const router = express.Router();
const {
  assignExamToStudent,
  getStudentExams,
  updateExamStatus,
  setStatus
} = require("../controllers/StudentExamController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

router.post("/assign", protect, adminOnly, assignExamToStudent);
router.get("/student", protect, getStudentExams);
router.post("/status", protect, setStatus);

router.put("/complete", protect, updateExamStatus);

module.exports = router;
