const Login = require("../models/Login");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

const RegisterController = async (req, res, next) => {
  try {
    const { username, student_id, password } = req.body;

    const existingStd = await Login.findOne({ student_id });
    if (existingStd)
      return res.status(400).json({ message: "Student-ID already exists" });

    const std = await Login.create({
      username,
      student_id,
      password,
      isAdmin: false,
    });

    res.status(201).json({
      message: "Registered successfully",
      token: generateToken(std),
      user: {
        student_id: std.student_id,
        username: std.username,
        isAdmin: std.isAdmin,
      },
    });
  } catch (err) {
    next(err);
  }
};

const LoginController = async (req, res, next) => {
  try {
    const { id, password } = req.body;

    const user = await Login.findOne({
      $or: [{ student_id: id }, { employeeId: id }, { username: id }],
    });
    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    } else if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Logged in successfully",
      token: generateToken(user),
      user: {
        _id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        employeeId: user.employeeId,
        student_id: user.student_id
  }
    });
  } catch (err) {
    next(err);
  }
};

const ForgotPasswordController = async (req, res, next) => {
  try {
    const { id, new_password } = req.body;

    const std = await Login.findOne({
      $or: [{ student_id: id }, { employeeId: id}],
    });

    if (!std) return res.status(401).json({ message: "Invalid ID" });

    std.password = new_password;
    await std.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  LoginController,
  RegisterController,
  ForgotPasswordController,
};
