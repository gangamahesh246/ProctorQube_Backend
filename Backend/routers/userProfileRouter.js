// const express = require("express");
// const router = express.Router();
// const { upload } = require("../utils/s3upload");
// const { protect } = require("../middleware/authMiddleware");
// const {
//   upsertBasicDetails,
//   updateEducationDetails,
//   updatePersonalDetails,
//   changePassword,
//   getProfile,
//   matchProfile,
// } = require("../controllers/userProfileController");

// router.post("/basic", protect, upload.single("photo"), upsertBasicDetails);

// router.put("/education", protect, updateEducationDetails);

// router.put("/personal", protect, updatePersonalDetails);

// router.put("/password", protect, changePassword);

// router.get("/", protect, getProfile);

// router.get("/match", protect, matchProfile);

// router.use((err, req, res, next) => {
//   if (err && err.name === 'MulterError') {
//     return res.status(400).json({ message: err.message });
//   }
//   next(err);
// });

// module.exports = router; 