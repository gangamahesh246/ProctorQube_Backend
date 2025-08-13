const express = require("express");
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  changeStudentPassword
} = require("../controllers/StudentLoginController");
const { protectStudent } = require("../middlewares/authMiddleware");

router.post("/studentregister", registerStudent);
router.post("/studentlogin", loginStudent);
router.put("/change-studentpassword", protectStudent, changeStudentPassword);

module.exports = router;
