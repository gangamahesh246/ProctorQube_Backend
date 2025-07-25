const express = require("express");
const router = express.Router();
const { protectStudent } = require("../middlewares/authMiddleware");
const {
  upsertProfile,
  getProfile,
  matchProfile,
  getTechnology
} = require("../controllers/StudentProfileController");

router.post("/student/profile", protectStudent, upsertProfile);
router.get("/student/getprofile", getProfile);
router.get("/student/gettechnology", getTechnology);
router.get("/student/matchprofile", protectStudent, matchProfile);

module.exports = router; 