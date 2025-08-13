const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  photo: { type: String }, 
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  dob: { type: Date },
  contactNumber: { type: String },
  email: { type: String, required: true, unique: true },
  alternateEmail: { type: String },
  address: { type: String },

  department: { type: String, required: true },
  designation: { type: String, required: true },
  dateOfJoining: { type: Date },
  facultyRoles: [{ type: String }],

  qualifications: [
    {
      degree: { type: String, required: true },
      institution: { type: String, required: true },
      yearOfPassing: { type: Number, required: true },
      specialization: { type: String, required: true },
      gradeOrPercentage: { type: String }
    }
  ],

  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model("Faculty", FacultySchema);
