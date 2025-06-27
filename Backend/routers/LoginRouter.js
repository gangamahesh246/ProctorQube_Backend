const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  LoginController,
  RegisterController,
  ForgotPasswordController,
  changePassword,
} = require("../controllers/LoginController"); 

router.post("/login", LoginController);
router.post("/register", RegisterController);
router.post("/forgot-password", ForgotPasswordController);
router.put("/change-password", protect, changePassword);

module.exports = router;
