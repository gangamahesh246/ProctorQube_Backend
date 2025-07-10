const Student = require("../models/StudentLogin");
const jwt = require("jsonwebtoken");

const generateToken = (student) => {
  return jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.registerStudent = async (req, res, next) => {
  try {
    const { username, college_mail, password } = req.body;

    const exists = await Student.findOne({ college_mail });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const newStudent = await Student.create({
      username,
      college_mail,
      password,
    });

    res.status(201).json({
      message: "Student registered successfully",
      token: generateToken(newStudent),
      user: {
        _id: newStudent._id,
        username: newStudent.username,
        college_mail: newStudent.college_mail,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.loginStudent = async (req, res, next) => {
  try {
    const { college_mail, password } = req.body;

    const student = await Student.findOne({college_mail: college_mail});

    if (!student || !(await student.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Student logged in successfully",
      token: generateToken(student),
      user: {
        _id: student._id,
        username: student.username,
        college_mail: student.college_mail,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.changeStudentPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await Student.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Student not found" });
    if (!newPassword) return res.status(400).json({ message: "New password is required" });

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
