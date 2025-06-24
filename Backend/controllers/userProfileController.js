const UserProfile = require("../models/UserProfile");
const { uploadFileToS3 } = require("../utils/s3upload");
const bcrypt = require("bcryptjs");

// Create/Update Basic Details
const upsertBasicDetails = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ 
        message: "Request body is missing. Did you use multipart/form-data?" 
      });
    }

    const { userId, username, email, phone } = req.body;

    let photo = null;
    if (req.file) {
      try {
        photo = await uploadFileToS3(req.file);
      } catch (e) {
        console.error("Error uploading profile photo to S3:", e);
        return res.status(500).json({ 
          message: "Error uploading profile photo", 
          error: e.message 
        });
      }
    }

    const basicDetails = {
      userId,
      username,
      email,
      phone,
      ...(photo && { photo })
    };

    const existingProfile = await UserProfile.findOne({ userId });

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await UserProfile.findOneAndUpdate(
        { userId },
        { $set: basicDetails },
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        message: "Basic details updated successfully",
        profile: updatedProfile,
      });
    } else {
      // Create new profile with default password
      const hashedPassword = await bcrypt.hash("default123", 12);
      const newProfile = new UserProfile({
        ...basicDetails,
        password: hashedPassword,
        // Set default values for required education fields
        college: "Not specified",
        department: "Not specified", 
        yearOfStudy: 1,
        rollNumber: "Not specified"
      });
      
      await newProfile.save();
      return res.status(201).json({
        message: "Basic details created successfully",
        profile: newProfile,
      });
    }
  } catch (error) {
    console.error("Error in upsertBasicDetails:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update Education Details
const updateEducationDetails = async (req, res) => {
  try {
    const { userId, college, department, yearOfStudy, rollNumber, skills } = req.body;

    const educationDetails = {
      college,
      department,
      yearOfStudy,
      rollNumber,
      skills: typeof skills === "string" ? JSON.parse(skills) : skills
    };

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: educationDetails },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({
      message: "Education details updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error in updateEducationDetails:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update Personal Details
const updatePersonalDetails = async (req, res) => {
  try {
    const { 
      userId, 
      dateOfBirth, 
      gender, 
      address, 
      bio, 
      guardianName 
    } = req.body;

    const personalDetails = {
      dateOfBirth,
      gender,
      address,
      bio,
      guardianName
    };

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: personalDetails },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({
      message: "Personal details updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error in updatePersonalDetails:", error);
    res.status(500).json({ message: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, profile.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    profile.password = hashedNewPassword;
    await profile.save();

    res.status(200).json({
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Full Profile
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

// Match Profile (for search)
const matchProfile = async (req, res) => {
  try {
    const { userId, username } = req.query;

    const match = await UserProfile.aggregate([
      {
        $match: {
          $or: [
            { userId: userId }, 
            { username: { $regex: username, $options: 'i' } }
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
          department: 1
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
  upsertBasicDetails,
  updateEducationDetails,
  updatePersonalDetails,
  changePassword,
  getProfile,
  matchProfile,
}; 