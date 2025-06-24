const StudentExam = require("../models/StudentExam");
const mongoose = require("mongoose");

const assignExamToStudent = async (req, res) => {
  const { studentId, examId, assignedBy } = req.body;

  try {
    let studentExam = await StudentExam.findOne({ student_id: studentId });

    const newExam = {
      examId,
      assignedBy,
      assignedAt: new Date(),
    };

    if (!studentExam) {
      studentExam = await StudentExam.create({
        student_id: studentId,
        exams: [newExam],
      });
    } else {
      studentExam.exams.push(newExam);
      await studentExam.save();
    }

    res.status(200).json({ message: "Exam assigned successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to assign exam." });
  }
};

const getStudentExams = async (req, res) => {
  const { student_id } = req.query;
  
  if (
    !student_id ||
    typeof student_id !== "string" ||
    !mongoose.Types.ObjectId.isValid(student_id)
  ) {
    return res.status(400).json({ message: "Invalid student ID format" });
  }

  try {
    const data = await StudentExam.findOne({
      student_id: new mongoose.Types.ObjectId(student_id),
    }).populate("exams.examId");

    if (!data) {
      return res.json({ exams: [] });
    }

    res.json({ exams: data.exams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching exams" });
  }
};

const updateExamStatus = async (req, res) => {
  const { examId, score } = req.body;

  try {
    const result = score >= 35 ? "pass" : "fail";

    const update = await StudentExam.updateOne(
      { student_id: req.user._id, "exams.examId": examId },
      {
        $set: {
          "exams.$.status": "completed",
          "exams.$.score": score,
          "exams.$.result": result,
        },
      }
    );

    if (update.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Exam not found or already updated." });
    }

    res.status(200).json({ message: "Exam updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update exam status." });
  }
};

module.exports = {
  assignExamToStudent,
  getStudentExams,
  updateExamStatus,
};
