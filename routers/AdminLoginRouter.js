const express = require("express");
const router = express.Router();
const { loginAdmin, changeAdminPassword, addAdmin } = require("../controllers/AdminLoginController");
const { sendOtp, verifyOtp, forgotPassword } = require("../controllers/Otpcontroller");
const { protectAdmin } = require("../middlewares/authMiddleware")

router.post("/adminlogin", loginAdmin);
router.post("/change-adminpassword", protectAdmin, changeAdminPassword);
router.post("/add-admin", protectAdmin, addAdmin);

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);

module.exports = router;
