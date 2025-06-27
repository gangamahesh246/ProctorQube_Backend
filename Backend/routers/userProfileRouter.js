const express = require("express");
const router = express.Router();
const { upload } = require("../utils/s3upload");
const { protect } = require("../middlewares/authMiddleware");
const {
  upsertProfile,
  getProfile,
  matchProfile,
} = require("../controllers/userProfileController");

// Single route for all profile operations (create/update)
router.post("/profile", protect, upload.single("photo"), upsertProfile);

// Get Full Profile
router.get("/getprofile", protect, getProfile);

// Match Profile (for search)
router.get("/matchprofile", protect, matchProfile);

// Multer error handler for better feedback
router.use((err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

module.exports = router; 