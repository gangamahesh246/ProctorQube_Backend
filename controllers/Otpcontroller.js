const Login = require("../models/StudentLogin");
const Admin = require("../models/AdminLogin");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const sendAndVerifyOtpController = {
  sendOtp: async (req, res, next) => {
    try {
      const { email } = req.body;

      let user = await Admin.findOne({ email });

      if (!user) {
        user = await Login.findOne({ college_mail: email });
      }

      if (!user) return res.status(404).json({ message: "User not found" });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = Date.now() + 10 * 60 * 1000;

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "ProctorQube Password Reset OTP",
        text: `Hello,

We received a request to reset your ProctorQube account password.

🔑 Your OTP is: ${otp}
🕒 This OTP is valid for only 10 minutes.

Please enter this code in the app to proceed with resetting your password.

If you didn’t request this, you can safely ignore this message.

- ProctorQube Security Team`,
      });

      res.json({ message: "OTP sent to email" });
    } catch (error) {
      next(error);
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      const { email, otp } = req.body;

      let user = await Admin.findOne({ email });
      let isAdmin = true;
      if (!user) {
        user = await Login.findOne({ college_mail: email });
        isAdmin = false;
      }

      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.otp !== otp || Date.now() > user.otpExpiry) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      const token = jwt.sign(
        { id: user._id, isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        message: "logged in successfully",
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          employeeId: user.employeeId,
          college_mail: user.college_mail,
          isAdmin,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    let user = await Admin.findOne({ email });
    if (!user) {
      user = await Login.findOne({ college_mail: email });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword; 
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
},

};

module.exports = sendAndVerifyOtpController;
