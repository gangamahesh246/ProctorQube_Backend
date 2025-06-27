const InterviewQuestion = require('../models/InterviewQuestion');
const XLSX = require('xlsx');

// Add new interview question (single)
const addInterviewQuestion = async (req, res) => {
  const { question, answer } = req.body;
  try {
    const newQuestion = new InterviewQuestion({ question, answer });
    await newQuestion.save();
    res.status(201).json({ message: 'Interview question added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all questions
const getAllInterviewQuestions = async (req, res) => {
  try {
    const questions = await InterviewQuestion.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Bulk upload from Excel
const bulkUploadQuestions = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const bulkData = rows.map(row => ({
      question: row.question,
      answer: row.answer
    }));

    await InterviewQuestion.insertMany(bulkData);
    res.status(200).json({ message: "Bulk questions uploaded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addInterviewQuestion,
  getAllInterviewQuestions,
  bulkUploadQuestions
};
