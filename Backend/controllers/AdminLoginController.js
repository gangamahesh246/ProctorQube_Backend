const Admin = require("../models/AdminLogin");
const jwt = require("jsonwebtoken");

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
