const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentLoginSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  college_mail: {
    type: String,
    unique: true,
    required: [true, "College email is required"]
  },
});

studentLoginSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentLoginSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("StudentLogin", studentLoginSchema);
