const express = require("express");
const router = express.Router();
const {
  assignExamToStudent,
  getStudentExams,
  updateExamStatus,
  setStatus,
  getStudentExamStats,
  GetAttempts,
  GlobalRank,
  getGlobalRank
} = require("../controllers/StudentExamController");

const {
  protectAdmin,
  protectStudent,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/Upload");

router.post("/assign", protectAdmin, assignExamToStudent);
router.get("/student", getStudentExams);
router.get("/studentprofilestats", protectStudent, getStudentExamStats);
router.get("/studentattempts", protectAdmin, GetAttempts);
router.post("/status", protectStudent, setStatus);
router.post("/globalrank", GlobalRank);
router.get("/getglobalrank", getGlobalRank);

router.post("/student/complete", protectStudent, upload.array("violationImage", 5), updateExamStatus);



module.exports = router;
