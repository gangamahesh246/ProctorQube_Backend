const express = require("express");
const router = express.Router();
const { upload } = require("../utils/s3upload");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const { upsertProfile, getProfile, matchProfile } = require("../controllers/profileController");

// const handleFileUpload = (req, res, next) => {
//   upload.single("Profile")(req, res, function (err) {
//     if (err instanceof multer.MulterError) {
//       if (err.code === "LIMIT_FILE_SIZE") {
//         return res
//           .status(400)
//           .json({ message: "File size should not exceed 2MB" });
//       }
//       return res.status(400).json({ message: err.message });
//     } else if (err) {
//       return res.status(400).json({ message: err });
//     }
//     next();
//   });
// };

router.post("/profile", protect, adminOnly, upload.single("photo"), upsertProfile);
router.get("/getprofile", getProfile);
router.get("/matchprofile", matchProfile);

module.exports = router;