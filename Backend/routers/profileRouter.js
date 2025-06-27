const express = require("express");
const router = express.Router();
const { upload } = require("../utils/s3upload");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const { upsertProfile, getProfile, matchProfile } = require("../controllers/profileController");

router.post("/profile", protect, adminOnly, upload.single("Profile"), upsertProfile);
router.post("/profile", protect, upload.single("photo"), upsertProfile);
router.get("/getprofile", getProfile);
router.get("/matchprofile", matchProfile);

module.exports = router;