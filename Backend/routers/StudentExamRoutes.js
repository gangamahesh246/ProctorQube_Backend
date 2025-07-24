const express = require("express");
const router = express.Router();
const {
  assignExamToStudent,
  getStudentExams,
  updateExamStatus,
  setStatus,
  getStudentExamStats,
  GetAttempts,
  Ranking,
} = require("../controllers/StudentExamController");

const {
  protectAdmin,
  protectStudent,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/Upload");

router.post("/assign", protectAdmin, assignExamToStudent);
router.get("/student", getStudentExams);
router.get("/studentprofilestats", getStudentExamStats);
router.get("/studentattempts", GetAttempts);
router.post("/status", protectStudent, setStatus);
router.put("/rank", Ranking);

router.post("/student/complete", protectStudent, upload.array("violationImage", 5), updateExamStatus);



module.exports = router;
