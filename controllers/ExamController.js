const Exam = require("../models/ExamModel");
const path = require("path");
const mongoose = require("mongoose");
const { uploadFileToS3 } = require("../utils/s3upload");

const postExam = async (req, res) => {
  try {
    let questions, settings;

    try {
      questions = JSON.parse(req.body.questions);
    } catch (e) {
      return res
        .status(400)
        .json({ message: "Invalid questions JSON", error: e.message });
    }

    try {
      settings = JSON.parse(req.body.settings);
    } catch (e) {
      return res
        .status(400)
        .json({ message: "Invalid settings JSON", error: e.message });
    }

    let coverPreview;
    if (req.file) {
      try {
        coverPreview = await uploadFileToS3(req.file);
      } catch (e) {
        return res
          .status(500)
          .json({ message: "Error uploading cover image", error: e.message });
      }
    } else {
      coverPreview = "/exam.jpg";
    }

    const basicInfo = {
      title: req.body.title,
      category: req.body.category,
      description: req.body.description || "",
      coverPreview,
    };

    if (
      !req.body.faculty_id ||
      !mongoose.Types.ObjectId.isValid(req.body.faculty_id)
    ) {
      return res.status(400).json({ message: "Valid Faculty ID is required" });
    }

    const newExam = new Exam({
      faculty_id: req.body.faculty_id,
      basicInfo,
      questions,
      settings,
    });

    await newExam.save();

    res.status(201).json({
      message: "New exam created successfully",
      exam: newExam,
    });
  } catch (error) {
    console.error("POST EXAM ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const GetExam = async (req, res) => {
  try {
    const { faculty_id } = req.query;

    if (!faculty_id || !mongoose.Types.ObjectId.isValid(faculty_id)) {
      return res.status(400).json({ message: "Valid faculty_id is required" });
    }

    const exams = await Exam.aggregate([
      {
        $match: { faculty_id: new mongoose.Types.ObjectId(faculty_id) },
      },
      {
        $project: {
          _id: 1,
          title: "$basicInfo.title",
          coverPreview: {
            $ifNull: ["$basicInfo.coverPreview", "/exam.jpg"],
          },
          category: "$basicInfo.category",
          examTime: "$settings.answerTimeControl.examTime",
          questionTime: "$settings.answerTimeControl.questionTime",
          passPercentage: "$settings.results.displayScore.passPercentage",
          fromDate: "$settings.availability.timeLimitDays.from",
          toDate: "$settings.availability.timeLimitDays.to",
          fromTime: "$settings.availability.timeLimitHours.from",
          toTime: "$settings.availability.timeLimitHours.to",
          questionsCount: {
            $size: { $ifNull: ["$questions", []] },
          },
          specificUsersCount: {
            $size: { $ifNull: ["$settings.assignExamTo.specificUsers", []] },
          },
        },
      },
    ]);

    res.status(200).json(exams);
  } catch (error) {
    console.error("Error getting exams:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getExamById = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }
    const exam = await Exam.findById(examId);
    res.status(200).json(exam);

    if (exam.length === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json(exam[0]);
  } catch (error) {
    console.error("Error getting exam by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getSpecificUsers = async (req, res) => {
  try {
    const { examId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json(exam.settings.assignExamTo.specificUsers);
  } catch (error) {
    console.error("Error getting exam by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getExamInstructions = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    const exam = await Exam.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(examId) },
      },
      {
        $project: {
          _id: 1,
          "basicInfo.title": 1,
          "basicInfo.category": 1,
          "settings.examTakenTimes.multiple": 1,
          "settings.results.displayScore.passPercentage": 1,
          "settings.results.displayScore.negativeMarking": 1,
          "settings.availability.lateTime": 1,
          "settings.availability.timeLimitDays.from": 1,
          "settings.availability.timeLimitDays.to": 1,
          "settings.availability.timeLimitHours.to": 1,
          "settings.answerTimeControl.examTime": 1,
          "settings.answerTimeControl.type": 1,
          "settings.answerTimeControl.questionTime": 1,
        },
      },
    ]);

    if (!exam || exam.length === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json(exam[0]);
  } catch (error) {
    console.error("Error getting exam by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getExamQuestionsById = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    const exam = await Exam.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(examId),
        },
      },
      {
        $project: {
          _id: 1,
          "basicInfo.title": 1,
          createdAt: 1,
          questions: 1,
          "settings.antiCheating": 1,
        },
      },
    ]);

    if (exam.length === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json(exam[0]);
  } catch (error) {
    console.error("Error getting exam by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const UpdateExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const settings = req.body.examData;

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      { $set: { settings: settings } },
      { new: true, runValidators: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({
      message: "Exam updated successfully",
      updatedExam,
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const deletedExam = await Exam.findByIdAndDelete(examId);
    if (!deletedExam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  postExam,
  GetExam,
  UpdateExam,
  getSpecificUsers,
  getExamById,
  getExamInstructions,
  deleteExam,
  getExamQuestionsById,
};
