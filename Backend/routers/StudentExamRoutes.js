const express = require("express");
const router = express.Router();
const {
  assignExamToStudent,
  getStudentExams,
  updateExamStatus,
  setStatus,
} = require("../controllers/StudentExamController");

const {
  protectAdmin,
  protectStudent,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/Upload");

router.post("/assign", protectAdmin, assignExamToStudent);
router.get("/student", getStudentExams);
router.post("/status", protectStudent, setStatus);

router.post("/student/complete", protectStudent, upload.array("violationImage", 5), updateExamStatus);



module.exports = router;
