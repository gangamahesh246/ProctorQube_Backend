const UserProfile = require("../models/StudentProfile");
const bcrypt = require("bcryptjs");

const upsertProfile = async (req, res) => {
  try {
    const { email, skills, ...rest } = req.body;

    const updates = {
      ...rest,
      email,
      skills: typeof skills === "string" ? JSON.parse(skills) : skills,
    };

    const existingProfile = await UserProfile.findOne({ email });

    if (existingProfile) {
      const updatedProfile = await UserProfile.findOneAndUpdate(
        { email },
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
    const { email } = req.query;
    const profile = await UserProfile.findOne({ email });

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
    const { userId } = req.query;

    const match = await UserProfile.aggregate([
      {
        $match: {
          userId: userId,
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
