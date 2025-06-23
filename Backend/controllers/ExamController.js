const Exam = require("../models/ExamModel");
const path = require("path");
const mongoose = require("mongoose");
const { uploadFileToS3 } = require("../utils/s3upload");

const postExam = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    let questions, settings;
    try {
      questions = JSON.parse(req.body.questions);
    } catch (e) {
      console.error("Error parsing questions:", e);
      return res.status(400).json({ message: "Invalid questions JSON", error: e.message });
    }
    try {
      settings = JSON.parse(req.body.settings);
    } catch (e) {
      console.error("Error parsing settings:", e);
      return res.status(400).json({ message: "Invalid settings JSON", error: e.message });
    }

    let coverPreview;
    if (req.file) {
      try {
        coverPreview = await uploadFileToS3(req.file);
      } catch (e) {
        console.error("Error uploading file to S3:", e);
        return res.status(500).json({ message: "Error uploading cover image", error: e.message });
      }
    } else {
      coverPreview = "/exam.jpg";
    }

    const basicInfo = {
      title: req.body.title,
      category: req.body.category,
      description: req.body.description || "",
      coverPreview: coverPreview,
    };

    const examData = {
      basicInfo,
      questions,
      settings,
    };

    let savedExam;
    try {
      const newExam = new Exam(examData);
      savedExam = await newExam.save();
    } catch (e) {
      console.error("Error saving exam to DB:", e);
      return res.status(500).json({ message: "Error saving exam to database", error: e.message });
    }

    res.status(201).json({
      message: "Exam created successfully",
      exam: savedExam,
    });
  } catch (error) {
    console.error("POST EXAM ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const GetExam = async (req, res) => {
  try {
    const exams = await Exam.aggregate([
      {
        $project: {
          _id: 1,
          "basicInfo.title": 1,
          "basicInfo.coverPreview": 1,
          "basicInfo.category": 1,
          "settings.examTakenTimes.multiple": 1,
          "settings.results.displayScore.totalPoints": 1,
          questionsCount: { $size: { $ifNull: ["$questions", []] } },
          "settings.assignExamTo.specificUsersCount": {
            $size: { $ifNull: ["$settings.assignExamTo.specificUsers", []] },
          },
          "settings.results.displayScore.passPercentage": 1,
          "settings.availability.lateTime": 1,
          "settings.availability.timeLimitDays.from": 1,
          "settings.availability.timeLimitDays.to": 1,
        },
      },
    ]);
    res.status(200).json(exams);
  } catch (error) {
    console.error("Error getting exams:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getExamById = async (req, res) => {
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
          settings: 1,
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
          questions: 1,
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
  getExamById,
  deleteExam,
  getExamQuestionsById,
};
