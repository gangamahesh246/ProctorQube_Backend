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
        "basicInfo settings.availability settings.results.displayScore.enabled settings.examTakenTimes",
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
    timeTaken,
    violations = {},
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
    const studentObjectId = new mongoose.Types.ObjectId(student_id);
    const examObjectId = new mongoose.Types.ObjectId(examId);

    const studentDoc = await StudentExam.findOne({
      student_id: studentObjectId,
      "exams.examId": examObjectId,
    });

    if (!studentDoc) {
      return res.status(404).json({ message: "Exam not found for student." });
    }

    const examEntry = studentDoc.exams.find((e) =>
      e.examId.equals(examObjectId)
    );

    if (!examEntry) {
      return res
        .status(404)
        .json({ message: "Exam not found in student record." });
    }

    const attemptCount = examEntry.attempts?.length || 0;

    const examModel = await mongoose.model("Exam").findById(examObjectId);
    const examTakenTimes = examModel?.settings?.examTakenTimes;

    const maxAttempts =
      examTakenTimes?.type === "multiple"
        ? examTakenTimes?.multiple
        : examTakenTimes?.type === "one"
        ? 1
        : Infinity;

    if (attemptCount >= maxAttempts) {
      return res.status(403).json({
        message: `You have exceeded the allowed number of attempts (${maxAttempts}).`,
      });
    }

    const isLastAttempt = attemptCount + 1 >= maxAttempts;
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
      timeTaken,
      violations,
    };

    const updatePayload = {
      $set: {
        "exams.$.score": score,
        "exams.$.result": result,
        ...(isLastAttempt && { "exams.$.status": "completed" }),
      },
      $push: {
        "exams.$.attempts": {
          score,
          result,
          attemptStart: new Date(attemptStart),
          attemptEnd: new Date(attemptEnd),
          timeTaken,
          stats,
        },
      },
    };

    const update = await StudentExam.updateOne(
      { student_id: studentObjectId, "exams.examId": examObjectId },
      updatePayload
    );

    if (update.modifiedCount === 0) {
      return res.status(404).json({
        message: "Exam not updated or already completed.",
      });
    }

    return res.status(200).json({
      message: isLastAttempt
        ? "Final attempt submitted. Exam marked as completed."
        : `Attempt ${attemptCount + 1}/${maxAttempts} submitted.`,
    });
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

const storeViolationPhoto = async (req, res) => {
  try {
    const { studentId, examId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    if (
      !studentId ||
      !examId ||
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(examId)
    ) {
      return res.status(400).json({ message: "Invalid studentId or examId." });
    }

    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const examObjectId = new mongoose.Types.ObjectId(examId);

    const imagePath = `/public/${file.filename}`;

    const updateResult = await StudentExam.updateOne(
      {
        student_id: studentObjectId,
        "exams.examId": examObjectId,
      },
      {
        $push: {
          "exams.$.stats.violationPhotos": imagePath,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Student or exam not found or update failed." });
    }

    return res.status(200).json({
      message: "Violation image stored successfully.",
      path: imagePath,
    });
  } catch (err) {
    console.error("storeViolationPhoto error:", err);
    return res
      .status(500)
      .json({ message: "Failed to store violation image." });
  }
};

module.exports = {
  assignExamToStudent,
  getStudentExams,
  updateExamStatus,
  setStatus,
  storeViolationPhoto,
};
