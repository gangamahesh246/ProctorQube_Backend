const UserProfile = require("../models/UserProfile");
const bcrypt = require("bcryptjs");
const { uploadFileToS3 } = require("../utils/s3upload");

const upsertProfile = async (req, res) => {
  try {
    const { userId, skills, ...rest } = req.body;

    let photo = null;
    if (req.file) {
      try {
        photo = await uploadFileToS3(req.file); // You must define this if using S3
      } catch (e) {
        console.error("Error uploading profile photo to S3:", e);
        return res
          .status(500)
          .json({ message: "Error uploading profile photo", error: e.message });
      }
    }

    const updates = {
      ...rest,
      userId,
      skills: typeof skills === "string" ? JSON.parse(skills) : skills,
    };

    if (photo) updates.photo = photo;

    const existingProfile = await UserProfile.findOne({ userId });

    if (existingProfile) {
      const updatedProfile = await UserProfile.findOneAndUpdate(
        { userId },
        updates,
        { new: true }
      );
      return res.status(200).json({
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    } else {
      const hashedPassword = await bcrypt.hash("default123", 12);
      const newProfile = new UserProfile({
        ...updates,
        password: hashedPassword,
      });

      await newProfile.save();
      return res.status(201).json({
        message: "Profile created successfully",
        profile: newProfile,
      });
    }
  } catch (error) {
    console.error("Error in upsertProfile:", error);
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const { userId } = req.query;
    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ message: error.message });
  }
};

const matchProfile = async (req, res) => {
  try {
    const { userId, username } = req.query;

    const match = await UserProfile.aggregate([
      {
        $match: {
          $or: [
            { userId: userId },
            { username: { $regex: username, $options: "i" } },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          username: 1,
          photo: 1,
          college: 1,
          department: 1,
          fullname: 1,
        },
      },
    ]);

    res.status(200).json(match);
  } catch (error) {
    console.error("Error in matchProfile:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  upsertProfile,
  getProfile,
  matchProfile,
};
