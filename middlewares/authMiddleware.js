const jwt = require("jsonwebtoken");
const Student = require("../models/StudentLogin");
const Admin = require("../models/AdminLogin");

const protectStudent = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Student.findById(decoded.id).select("-password");
      if (!req.user)
        return res.status(401).json({ message: "Student not found" });
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

const protectAdmin = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Admin.findById(decoded.id).select("-password");
      if (!req.user)
        return res.status(401).json({ message: "Admin not found" });
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

module.exports = { protectStudent, protectAdmin };
