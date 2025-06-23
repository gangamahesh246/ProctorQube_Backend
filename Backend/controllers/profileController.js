const Profile = require("../models/FacultyProfile");
const { uploadFileToS3 } = require("../utils/s3upload");

const upsertProfile = async (req, res) => {
  try {
    const { employeeId, qualifications, ...rest } = req.body;

    let photo = null;
    if (req.file) {
      try {
        photo = await uploadFileToS3(req.file);
      } catch (e) {
        console.error("Error uploading profile photo to S3:", e);
        return res.status(500).json({ message: "Error uploading profile photo", error: e.message });
      }
    }

    const updates = {
      ...rest,
      employeeId,
      qualifications:
        typeof qualifications === "string"
          ? JSON.parse(qualifications)
          : qualifications,
    };

    if (photo) updates.photo = photo;

    const existingProfile = await Profile.findOne({ employeeId });

    if (existingProfile) {
      const updatedProfile = await Profile.findOneAndUpdate(
        { employeeId },
        updates,
        { new: true }
      );
      return res.status(200).json({
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    } else {
      const newProfile = new Profile(updates);
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

module.exports = { upsertProfile };

const getProfile = async (req, res) => {
  try {
    const { employeeId } = req.query;
    const profile = await Profile.findOne({ employeeId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const matchProfile = async (req, res) => {
  try {
    const { employeeId, username } = req.query;

    const match = await Profile.aggregate([
      {
        $match: {
          $or: [{ employeeId: employeeId }, { username: username }],
        },
      },
      {
        $project: {
          _id: 0,
          fullName: 1,
          photo: 1,
        },
      },
    ]);

    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  upsertProfile,
  matchProfile,
};
