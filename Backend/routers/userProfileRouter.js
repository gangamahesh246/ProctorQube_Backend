const express = require("express");
const router = express.Router();
const { upload } = require("../utils/s3upload");
const { protect } = require("../middleware/authMiddleware");
const {
  upsertProfile,
  getProfile,
  matchProfile,
} = require("../controllers/userProfileController");

router.post("/student/profile", protect, upload.single("photo"), upsertProfile);

router.get("/student/getprofile", protect, getProfile);

router.get("/student/matchprofile", protect, matchProfile);

module.exports = router; 