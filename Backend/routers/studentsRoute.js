const express = require("express");
const router = express.Router();
const { GetStudents, deleteBranch, PostOrUpdateStudents, PostSingleStudent, deleteStudentById, GetStudentId } = require("../controllers/studentscontroller");
const { protectAdmin, protectStudent } = require("../middlewares/authMiddleware");

router.get("/getstudents", protectAdmin, GetStudents);
router.get("/getstudentId", protectStudent, GetStudentId);
router.delete("/deletebranch", protectAdmin, deleteBranch);
router.delete("/deletestudent/:mail", protectAdmin, deleteStudentById);
router.post("/uploadstudent", protectAdmin, PostSingleStudent);
router.post("/uploadstudents", protectAdmin, PostOrUpdateStudents);

module.exports = router;