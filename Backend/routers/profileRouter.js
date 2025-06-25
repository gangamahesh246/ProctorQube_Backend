const express = require("express");
const router = express.Router();
const { upload } = require("../utils/s3upload");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const { upsertProfile, getProfile, matchProfile } = require("../controllers/profileController");


<<<<<<< HEAD
router.post("/profile", protect, adminOnly, upload.single("Profile"), upsertProfile);
=======
router.post("/profile", protect, upload.single("photo"), upsertProfile);
>>>>>>> a676dc3ea6dc2878110f1b92be55d3176e728639
router.get("/getprofile", getProfile);
router.get("/matchprofile", matchProfile);

module.exports = router;