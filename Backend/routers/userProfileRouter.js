const express = require("express");
const router = express.Router();
const { upload } = require("../utils/s3upload");
const { protect } = require("../middleware/authMiddleware");
const {
  upsertBasicDetails,
  updateEducationDetails,
  updatePersonalDetails,
  changePassword,
  getProfile,
  matchProfile,
} = require("../controllers/userProfileController");

// Basic Details - Create/Update with photo upload
router.post("/basic", protect, upload.single("photo"), upsertBasicDetails);

// Education Details - Update
router.put("/education", protect, updateEducationDetails);

// Personal Details - Update
router.put("/personal", protect, updatePersonalDetails);

// Change Password
router.put("/password", protect, changePassword);

// Get Full Profile
router.get("/", protect, getProfile);

// Match Profile (for search)
router.get("/match", protect, matchProfile);

// Multer error handler for better feedback
router.use((err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

module.exports = router; 