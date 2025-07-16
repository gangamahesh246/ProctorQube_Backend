const Students = require("../models/studentsModel");

const GetStudents = async (req, res) => {
  try {
    const students = await Students.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTechnology = async (req, res) => {
  try {
    const { technology } = req.body;

    if (!technology) {
      return res.status(400).json({ message: "Technology is required" });
    }

    const existing = await Students.findOne({ technology });

    if (!existing) {
      return res.status(404).json({ message: "Technology not found" });
    }

    await Students.deleteMany({ technology });

    return res
      .status(200)
      .json({ message: `Technology '${technology}' deleted successfully` });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const PostSingleStudent = async (req, res) => {
  const { technology, student_mail } = req.body;

  if (!technology || !student_mail) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const exists = await Students.findOne({ technology, student_mail });

  if (exists) {
    return res.status(200).json({ message: "Student already exists" });
  }

  const student = new Students({ technology, student_mail });
  await student.save();

  res.status(201).json({ message: "Student added", data: student });
};

const PostOrUpdateStudents = async (req, res) => {
  try {
    const { technology, students } = req.body;

    if (!technology || !Array.isArray(students)) {
      return res.status(400).json({ message: "Invalid input format" });
    }

    const formattedStudents = students.map((email) => ({
      student_mail: email,
      technology,
    }));

    const existingStudents = await Students.find({
      technology,
      student_mail: { $in: students },
    });

    const existingEmails = new Set(existingStudents.map((s) => s.student_mail));

    const newStudents = formattedStudents.filter(
      (s) => !existingEmails.has(s.student_mail)
    );

    if (newStudents.length === 0) {
      return res
        .status(200)
        .json({ message: "No new students to add. All already exist." });
    }

    const inserted = await Students.insertMany(newStudents);

    res.status(201).json({
      message: "Students added successfully",
      added: inserted.length,
      skipped: existingEmails.size,
      data: inserted,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const deleteStudentById = async (req, res) => {
  try {
    const { mail } = req.params;
    const deletedStudent = await Students.findOneAndDelete({
      student_mail: mail,
    });
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res
      .status(200)
      .json({ message: "Student deleted successfully", data: deletedStudent });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const GetStudentId = async (req, res) => {
  const { student_mail } = req.query;

  try {
    const student = await Students.findOne({ student_mail });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ studentId: student._id });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  GetStudents,
  deleteTechnology,
  PostOrUpdateStudents,
  PostSingleStudent,
  deleteStudentById,
  GetStudentId,
};
