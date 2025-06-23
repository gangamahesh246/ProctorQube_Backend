const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = require("../middleware/Upload");
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

router.post("/profile", upsertProfile);
router.get("/getprofile", getProfile);
router.get("/matchprofile", matchProfile);

module.exports = router;