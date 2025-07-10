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
  protectAdmin,
  protectStudent
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/Upload");

router.post("/assign", protectAdmin, assignExamToStudent);
router.get("/student", protectStudent, getStudentExams);
router.post("/status", protectStudent, setStatus);

router.post("/student/complete", protectStudent, updateExamStatus);
router.post("/student/violation", protectStudent, upload.single("violationImage"), storeViolationPhoto);

module.exports = router;
