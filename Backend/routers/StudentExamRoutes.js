const express = require("express");
const router = express.Router();
const {
  assignExamToStudent,
  getStudentExams,
  updateExamStatus,
  setStatus,
  storeViolationPhoto
} = require("../controllers/StudentExamController");

const {
  protect,
  adminOnly,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/Upload");

router.post("/assign", protect, adminOnly, assignExamToStudent);
router.get("/student", protect, getStudentExams);
router.post("/status", protect, setStatus);

router.post("/student/complete", protect, updateExamStatus);
router.post("/student/violation", protect, upload.single("violationImage"), updateExamStatus);

module.exports = router;
