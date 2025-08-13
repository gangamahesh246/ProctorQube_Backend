const Question = require("../models/questionsModel");

const GetQuestions = async (req, res) => {
  try {
    const { faculty_id } = req.query;

    const filter = faculty_id ? { faculty_id } : {};

    const questions = await Question.find(filter).lean(); 
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const PostOrUpdateQuestions = async (req, res) => {
  try {
    const { faculty_id, category, questions } = req.body;

    if (!faculty_id || !category || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid input format" });
    }

    const formattedQuestions = questions.map((q) => ({
      question: q.question,
      options: q.options,
      multiple_response: Array.isArray(q.correct) && q.correct.length > 1,
      correct: q.correct,
      marks: q.marks ?? 1,
    }));

    const existing = await Question.findOne({ faculty_id, category });

    if (existing) {
      existing.questions = [...existing.questions, ...formattedQuestions];
      await existing.save();
      return res.status(200).json({
        message: "Questions added successfully",
        data: existing,
      });
    }

    const newDoc = new Question({
      faculty_id,
      category,
      questions: formattedQuestions,
    });

    await newDoc.save();
    res.status(201).json({ message: "Questions uploaded successfully", data: newDoc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { faculty_id, category } = req.body;

    const existing = await Question.findOne({ faculty_id, category });

    if (!existing) {
      return res.status(404).json({ message: "Category not found for this faculty" });
    }

    await Question.deleteOne({ faculty_id, category });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  GetQuestions,
  PostOrUpdateQuestions,
  deleteCategory,
};
