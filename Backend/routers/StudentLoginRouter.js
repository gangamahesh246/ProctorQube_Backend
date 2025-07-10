const express = require("express");
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  changeStudentPassword
} = require("../controllers/StudentLoginController");
const { protectStudent } = require("../middlewares/authMiddleware");

router.post("/register", registerStudent);
router.post("/studentlogin", loginStudent);
router.post("/change-studentpassword", protectStudent, changeStudentPassword);

module.exports = router;
