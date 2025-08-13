const InterviewQuestion = require('../models/InterviewQuestion');

const getInterviewQuestionsByTechnology = async (req, res) => {
  try {
    const { technology } = req.query;

    if (!technology) {
      return res.status(400).json({ error: "Technology is required" });
    }

    const questions = await InterviewQuestion.find({
      technology: { $regex: `^${technology}$`, $options: 'i' }
    });

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const PostOrUpdateInterviewQuestions = async (req, res) => {
  try {
    const { technology, questions } = req.body;

    if (!technology || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid input format" });
    }

    const formattedQuestions = questions.map((q) => ({
      question: q.question,
      answer: q.answer,
      explanation: q.explanation || "",
    }));

    const existing = await InterviewQuestion.findOne({
      technology: { $regex: `^${technology}$`, $options: "i" },
    });

    if (existing) {
      existing.questions = [...existing.questions, ...formattedQuestions];
      await existing.save();
      return res.status(200).json({
        message: "Interview questions added successfully",
        data: existing,
      });
    }

    const data = new InterviewQuestion({
      technology,
      questions: formattedQuestions,
    });

    await data.save();
    res.status(201).json({
      message: "Interview questions uploaded successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getInterviewQuestionsByTechnology,
  PostOrUpdateInterviewQuestions
};
