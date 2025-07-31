const Admin = require("../models/AdminLogin");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const generateToken = (admin) => {
  return jwt.sign({ id: admin._id, isAdmin: true }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.loginAdmin = async (req, res, next) => {
  try {
    const { id, password } = req.body;

    const admin = await Admin.findOne({employeeId: id});

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!admin.isAdmin) {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    res.status(200).json({
      message: "Admin logged in successfully",
      token: generateToken(admin),
      user: {
        _id: admin._id,
        username: admin.username,
        employeeId: admin.employeeId,
        isAdmin: admin.isAdmin,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await Admin.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Admin not found" });
    if (!newPassword) return res.status(400).json({ message: "New password is required" });

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.addAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ message: "Only valid Gmail addresses are allowed." });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Admin with this email already exists." });
    }

    let employeeId;
    let isUnique = false;
    while (!isUnique) {
      employeeId = Math.floor(10000 + Math.random() * 90000).toString();
      const exists = await Admin.findOne({ employeeId });
      if (!exists) isUnique = true;
    }

    const newAdmin = new Admin({
      email,
      employeeId,
      isAdmin: true,
    });

    await newAdmin.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ProctorQube Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "You have been added as an Admin to ProctorQube",
      html: `
        <p>Hello,</p>
        <p>You have been registered as an admin on <strong>ProctorQube</strong>.</p>
        <p><strong>Admin ID:</strong> ${employeeId}</p>
        <p>Please visit <a href="https://your-proctorqube-site.com/admin/forgot-password">Forgot Password</a> to set your password and access the admin panel.</p>
        <p>Thank you!</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Admin created and email sent successfully.",
      admin: { email, employeeId },
    });
  } catch (err) {
    console.error("Add Admin Error:", err);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};