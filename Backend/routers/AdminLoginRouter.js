const express = require("express");
const router = express.Router();
const { loginAdmin, changeAdminPassword } = require("../controllers/AdminLoginController");
const { protectAdmin } = require("../middlewares/authMiddleware")

router.post("/adminlogin", loginAdmin);
router.post("/change-adminpassword", protectAdmin, changeAdminPassword);

module.exports = router;
