const Students = require("../models/studentsModel");
const mongoose = require("mongoose");

const allowedDomains = ["@aec.edu.in", "@acet.ac.in", "@acoe.edu.in"];

const isValidCollegeEmail = (email) => {
  return (
    typeof email === "string" &&
    allowedDomains.some((domain) => email.endsWith(domain))
  );
};

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

  if (!isValidCollegeEmail(student_mail)) {
    return res.status(400).json({
      message: "Invalid student email. Must end with @aec.edu.in, @acet.ac.in, or @acoe.edu.in.",
    });
  }

  const existing = await Students.findOne({
    faculty_id,
    "students.student_mail": student_mail,
  });

  if (existing) {
    return res.status(200).json({ message: "Student email already exists under this faculty" });
  }

  let doc = await Students.findOne({ faculty_id, technology });
  if (!doc) {
    doc = new Students({ faculty_id, technology, students: [] });
  }

  doc.students.push({ student_mail });
  await doc.save();

  res.status(201).json({
    message: "Student added successfully",
    data: doc,
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
    return res.status(400).json({ message: "No valid emails found." });
  }

  const allDocs = await Students.find({ faculty_id });

  const allExistingEmails = new Set();
  allDocs.forEach((doc) =>
    doc.students.forEach((s) => allExistingEmails.add(s.student_mail))
  );

  let currentDoc = allDocs.find((doc) => doc.technology === technology);
  if (!currentDoc) {
    currentDoc = new Students({ faculty_id, technology, students: [] });
  }

  const newEmails = validStudents.filter((email) => !allExistingEmails.has(email));

  if (newEmails.length === 0) {
    return res.status(200).json({ message: "All students already exist" });
  }

  newEmails.forEach((email) => currentDoc.students.push({ student_mail: email }));
  await currentDoc.save();

  res.status(201).json({
    message: "Students added successfully",
    added: newEmails.length,
    skipped: students.length - newEmails.length,
    data: currentDoc,
  });
};

const deleteStudentById = async (req, res) => {
  const { mail } = req.params;
  const { faculty_id, technology } = req.body;

  if (!faculty_id || !technology || !mail) {
    return res.status(400).json({ message: "faculty_id, technology, and mail are required" });
  }

  const doc = await Students.findOne({ faculty_id, technology });

  if (!doc) {
    return res.status(404).json({ message: "Technology group not found" });
  }

  const index = doc.students.findIndex((s) => s.student_mail === mail);
  if (index === -1) {
    return res.status(404).json({ message: "Student not found" });
  }

  const removed = doc.students.splice(index, 1);
  await doc.save();

  res.status(200).json({
    message: "Student deleted successfully",
    data: removed[0],
  });
};

const GetStudentId = async (req, res) => {
  const { student_mail } = req.query;

  try {
    const record = await Students.findOne({
      students: { $elemMatch: { student_mail } },
    });

    if (!record) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = record.students.find((s) => s.student_mail === student_mail);
    res.status(200).json({ studentId: student?._id });
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
    const docs = await Students.find({
      students: {
        $elemMatch: { student_mail: { $in: student_mails } },
      },
    });

    const result = [];
    docs.forEach((doc) => {
      doc.students.forEach((s) => {
        if (student_mails.includes(s.student_mail)) {
          result.push({ mail: s.student_mail, id: s._id });
        }
      });
    });

    if (!result.length) {
      return res.status(404).json({ message: "No students found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
    const docs = await Students.find({
      "students._id": { $in: student_ids.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    const result = [];

    docs.forEach((doc) => {
      doc.students.forEach((s) => {
        if (student_ids.includes(s._id.toString())) {
          result.push({ id: s._id, mail: s.student_mail });
        }
      });
    });

    if (!result.length) {
      return res.status(404).json({ message: "No students found" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
