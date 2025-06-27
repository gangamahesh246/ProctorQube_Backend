const express = require("express");
const router = express.Router();
const { GetStudents, deleteBranch, PostOrUpdateStudents, PostSingleStudent, deleteStudentById, GetStudentId } = require("../controllers/studentscontroller");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

router.get("/getstudents", protect, adminOnly, GetStudents);
router.get("/getstudentId", protect, GetStudentId);
router.delete("/deletebranch", protect, adminOnly, deleteBranch);
router.delete("/deletestudent/:mail", protect, adminOnly, deleteStudentById);
router.post("/uploadstudent", protect, adminOnly, PostSingleStudent);
router.post("/uploadstudents", protect, adminOnly, PostOrUpdateStudents);

module.exports = router;