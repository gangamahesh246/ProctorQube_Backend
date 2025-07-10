const express = require("express");
const router = express.Router();
const { upload } = require("../utils/s3upload");
const { protectAdmin } = require("../middlewares/authMiddleware");

const { upsertProfile, getProfile, matchProfile } = require("../controllers/profileController");

router.post("/profile", protectAdmin, upload.single("Profile"), upsertProfile);
router.get("/getprofile", getProfile);
router.get("/matchprofile", matchProfile);

module.exports = router;