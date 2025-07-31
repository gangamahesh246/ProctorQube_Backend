const Students = require("../models/studentsModel");
const mongoose = require("mongoose");

const GetStudents = async (req, res) => {
  const { faculty_id } = req.query;
  try {
    const data = await Students.find({ faculty_id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTechnology = async (req, res) => {
  const { faculty_id, technology } = req.body;

  if (!faculty_id || !technology) {
    return res.status(400).json({ message: "faculty_id and technology are required" });
  }

  const deleted = await Students.findOneAndDelete({ faculty_id, technology });

  if (!deleted) {
    return res.status(404).json({ message: "Technology not found for this faculty" });
  }

  res.status(200).json({
    message: `Technology '${technology}' deleted successfully`,
    data: deleted,
  });
};

const PostSingleStudent = async (req, res) => {
  const { faculty_id, technology, student_mail } = req.body;

  if (!faculty_id || !technology || !student_mail) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const allowedDomains = ["@aec.edu.in", "@acet.ac.in", "@acoe.edu.in"];
  if (!allowedDomains.some((domain) => student_mail.endsWith(domain))) {
    return res.status(400).json({
      message: "Invalid student email. Must end with @aec.edu.in, @acet.ac.in, or @acoe.edu.in.",
    });
  }

  const existing = await Students.findOne({ faculty_id, student_mail });
  if (existing) {
    return res.status(200).json({ message: "Student already exists under this faculty." });
  }

  const newStudent = new Students({ faculty_id, technology, student_mail });
  await newStudent.save();

  res.status(201).json({
    message: "Student added successfully",
    data: newStudent,
  });
};

const PostOrUpdateStudents = async (req, res) => {
  const { faculty_id, technology, students } = req.body.data;

  if (!faculty_id || !technology || !Array.isArray(students)) {
    return res.status(400).json({ message: "Invalid input format" });
  }

  const allowedDomains = ["@aec.edu.in", "@acet.ac.in", "@acoe.edu.in"];
  const validStudents = students.filter((email) =>
    allowedDomains.some((domain) => email.endsWith(domain))
  );

  if (validStudents.length === 0) {
    return res.status(400).json({ message: "No valid student emails." });
  }

  const existingDocs = await Students.find({ faculty_id });
  const existingEmails = new Set(existingDocs.map((s) => s.student_mail));

  const newEmails = validStudents.filter((email) => !existingEmails.has(email));
  if (newEmails.length === 0) {
    return res.status(200).json({ message: "All students already exist." });
  }

  const newDocs = newEmails.map((email) => ({
    faculty_id,
    technology,
    student_mail: email,
  }));

  await Students.insertMany(newDocs);

  res.status(201).json({
    message: "Students added successfully",
    added: newEmails.length,
    skipped: students.length - newEmails.length,
    data: newEmails,
  });
};

const deleteStudentById = async (req, res) => {
  const { mail } = req.params;
  const { faculty_id, technology } = req.body;

  if (!faculty_id || !technology || !mail) {
    return res.status(400).json({ message: "faculty_id, technology, and mail are required" });
  }

  try {
    const deleted = await Students.findOneAndDelete({
      faculty_id,
      technology,
      student_mail: mail,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const GetStudentId = async (req, res) => {
  const { student_mail } = req.query;

  if (!student_mail) {
    return res.status(400).json({ message: "student_mail is required" });
  }

  try {
    const student = await Students.findOne({ student_mail: student_mail });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ studentId: student._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const GetStudentIds = async (req, res) => {
  let { student_mails } = req.query;

  if (typeof student_mails === "string") {
    student_mails = [student_mails];
  }

  if (!Array.isArray(student_mails) || student_mails.length === 0) {
    return res.status(400).json({ message: "No student emails provided" });
  }

  try {
    const docs = await Students.find(
      { student_mail: { $in: student_mails } },
      { student_mail: 1 } 
    );

    const result = docs.map((doc) => ({
      mail: doc.student_mail,
      id: doc._id,
    }));

    if (result.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const GetStudentMails = async (req, res) => {
  let { student_ids } = req.query;

  if (typeof student_ids === "string") {
    student_ids = [student_ids];
  }

  if (!Array.isArray(student_ids) || student_ids.length === 0) {
    return res.status(400).json({ message: "No student IDs provided" });
  }

  try {
    const objectIds = student_ids.map((id) => new mongoose.Types.ObjectId(id));

    const students = await Students.find(
      { _id: { $in: objectIds } },
      { _id: 1, student_mail: 1 }
    );

    if (!students.length) {
      return res.status(404).json({ message: "No students found" });
    }

    const result = students.map((s) => ({
      id: s._id,
      mail: s.student_mail,
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  GetStudents,
  deleteTechnology,
  PostOrUpdateStudents,
  PostSingleStudent,
  deleteStudentById,
  GetStudentId,
  GetStudentIds,
  GetStudentMails,
};
