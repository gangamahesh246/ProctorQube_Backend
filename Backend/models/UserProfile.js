const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  username: { 
    type: String, 
    required: true 
  },
  fullname: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    required: true 
  },
  photo: { 
    type: String 
  },

  college: { 
    type: String, 
    required: true 
  },
  department: { 
    type: String, 
    required: true 
  },
  yearOfStudy: { 
    type: Number, 
    required: true,
    min: 1,
    max: 10
  },
  rollNumber: { 
    type: String, 
    required: true 
  },
  skills: [{ 
    type: String 
  }],

  dateOfBirth: { 
    type: Date 
  },
  gender: { 
    type: String, 
    enum: ["Male", "Female", "Other"] 
  },
  address: { 
    type: String 
  },
  bio: { 
    type: String,
    maxlength: 500
  },
  guardianName: { 
    type: String 
  },
  guardianphone: { 
    type: String, 
    required: true 
  },

  // Password (hashed)
  password: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("UserProfile", UserProfileSchema); 