const express = require("express");
const router = express.Router();
const { upload } = require("../utils/s3upload");
const { protectStudent } = require("../middlewares/authMiddleware");
const {
  upsertProfile,
  getProfile,
  matchProfile,
} = require("../controllers/userProfileController");

router.post("/student/profile", protectStudent, upload.single("photo"), upsertProfile);
router.get("/student/getprofile", protectStudent, getProfile);
router.get("/student/matchprofile", protectStudent, matchProfile);

module.exports = router; 