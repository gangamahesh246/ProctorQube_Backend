const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminLoginSchema = new mongoose.Schema({
  username: { type: String, trim: true },
  password: { type: String },
  email: { type: String, required: true },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Number,
    default: null,
  },
  isAdmin: { type: Boolean, default: true },
});

adminLoginSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminLoginSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("AdminLogin", adminLoginSchema);
