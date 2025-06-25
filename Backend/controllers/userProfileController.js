// const UserProfile = require("../../models/UserProfile");
// const { uploadFileToS3 } = require("../../utils/s3upload");
// const bcrypt = require("bcryptjs");

// const getProfile = async (req, res) => {
//   try {
//     const { userId } = req.query;
//     const profile = await UserProfile.findOne({ userId });
//     if (!profile) return res.status(404).json({ message: "Profile not found" });
//     res.status(200).json(profile);
//   } catch (error) {
//     console.error("Error in getProfile:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// const upsertProfile = async (req, res) => {
//   try {
//     const { userId, username, email, phone } = req.body;

//     let photo = null;
//     if (req.file) {
//       try {
//         photo = await uploadFileToS3(req.file);
//       } catch (e) {
//         return res.status(500).json({ message: "Error uploading profile photo", error: e.message });
//       }
//     }

//     const basicDetails = { userId, username, email, phone, ...(photo && { photo }) };

//     const existingProfile = await UserProfile.findOne({ userId });

//     if (existingProfile) {
//       const updatedProfile = await UserProfile.findOneAndUpdate(
//         { userId },
//         { $set: basicDetails },
//         { new: true, runValidators: true }
//       );
//       return res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });
//     } else {
//       const hashedPassword = await bcrypt.hash("default123", 12);
//       const newProfile = new UserProfile({
//         ...basicDetails,
//         password: hashedPassword,
//         college: "Not specified",
//         department: "Not specified",
//         yearOfStudy: 1,
//         rollNumber: "Not specified"
//       });
//       await newProfile.save();
//       return res.status(201).json({ message: "Profile created successfully", profile: newProfile });
//     }
//   } catch (error) {
//     console.error("Error in upsertProfile:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// const matchProfile = async (req, res) => {
//   try {
//     const { userId, username } = req.query;

//     const match = await UserProfile.aggregate([
//       {
//         $match: {
//           $or: [
//             { userId: userId }, 
//             { username: { $regex: username, $options: "i" } }
//           ],
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           userId: 1,
//           username: 1,
//           photo: 1,
//           college: 1,
//           department: 1,
//         },
//       },
//     ]);

//     res.status(200).json(match);
//   } catch (error) {
//     console.error("Error in matchProfile:", error);
//     res.status(500).json({ message: error.message });
//   }
// };


// module.exports = {
//   getProfile, upsertProfile, matchProfile
// };
