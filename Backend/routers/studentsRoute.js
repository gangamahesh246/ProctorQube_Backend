const express = require("express");
const router = express.Router();
const { GetStudents, deleteTechnology, PostOrUpdateStudents, PostSingleStudent, deleteStudentById, GetStudentId } = require("../controllers/studentscontroller");
const { protectAdmin, protectStudent } = require("../middlewares/authMiddleware");

router.get("/getstudents", protectAdmin, GetStudents);
router.get("/getstudentId", protectStudent, GetStudentId);
router.delete("/deletebranch", protectAdmin, deleteTechnology);
router.delete("/deletestudent/:mail", protectAdmin, deleteStudentById);
router.post("/uploadstudent", protectAdmin, PostSingleStudent);
router.post("/uploadstudents", protectAdmin, PostOrUpdateStudents);

module.exports = router;