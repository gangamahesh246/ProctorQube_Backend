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
    }).populate({
      path: "exams.examId",
      select:
        "basicInfo settings.availability.timeLimitDays.from settings.availability.timeLimitDays.to settings.availability.timeLimitHours.from settings.availability.timeLimitHours.to",
    });

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
  const {
    examId,
    student_id,
    score,
    title,
    category,
    totalMarks,
    passMark,
    startTime,
    endTime,
    duration,
    attemptStart,
    attemptEnd,
  } = req.body;


  if (
    !student_id ||
    typeof student_id !== "string" ||
    !mongoose.Types.ObjectId.isValid(student_id)
  ) {
    return res.status(400).json({ message: "Invalid student ID format" });
  } 

  if (
    !examId ||
    typeof examId !== "string" ||
    !mongoose.Types.ObjectId.isValid(examId)
  ) {
    return res.status(400).json({ message: "Invalid exam ID format" });
  }

  try {
    const result = score >= passMark ? "pass" : "fail";

    const stats = {
      title: title?.trim() || "Untitled",
      category: category?.trim() || "General",
      totalMarks,
      passMark,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      score,
      attemptStart: new Date(attemptStart),
      attemptEnd: new Date(attemptEnd),
    };

    const studentObjectId = new mongoose.Types.ObjectId(student_id);
    const examObjectId = new mongoose.Types.ObjectId(examId);

    const update = await StudentExam.updateOne(
      { student_id: studentObjectId, "exams.examId": examObjectId },
      {
        $set: {
          "exams.$.status": "completed",
          "exams.$.score": score,
          "exams.$.result": result,
          "exams.$.stats": stats,
        },
      }
    );

    if (update.modifiedCount === 0) {
      return res.status(404).json({
        message: "Exam not found or already updated.",
      });
    }

    return res.status(200).json({ message: "Exam updated successfully." });
  } catch (err) {
    console.error("Error updating exam status:", err);
    return res.status(500).json({ message: "Failed to update exam status." });
  }
};

const setStatus = async (req, res) => {
  const { examId, status, student_id } = req.body;

  if (
    !student_id ||
    typeof student_id !== "string" ||
    !mongoose.Types.ObjectId.isValid(student_id)
  ) {
    return res.status(400).json({ message: "Invalid student ID format" });
  }

  try {
    const update = await StudentExam.updateOne(
      {
        student_id: new mongoose.Types.ObjectId(student_id),
        "exams.examId": examId,
      },
      { $set: { "exams.$.status": status } }
    );

    if (update.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Exam not found or already updated." });
    }

    return res.status(200).json({ message: "Status updated successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update exam status." });
  }
};

module.exports = {
  assignExamToStudent,
  getStudentExams,
  updateExamStatus,
  setStatus,
};
