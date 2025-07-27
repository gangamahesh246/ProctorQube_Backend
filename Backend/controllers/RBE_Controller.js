const LeaderBoard = require("../models/ResultsByExam");

const getLeaderBoard = async (req, res) => {
  const { examId } = req.query;

  try {
    const leaderBoard = await LeaderBoard.find({ examId }).sort({ score: -1 });

    if (!leaderBoard || leaderBoard.length === 0) {
      return res
        .status(404)
        .json({ message: "Leaderboard not found for this exam" });
    }
    res.status(200).json(leaderBoard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateLeaderBoard = async (req, res) => {
  const {
    examId,
    student_mail,
    score,
    correct,
    incorrect,
    violations,
    totalMarks,
  } = req.body;

  try {
    const existingEntry = await LeaderBoard.findOne({ examId, student_mail });

    if (existingEntry) {
      existingEntry.score = score;
      existingEntry.correct = correct;
      existingEntry.incorrect = incorrect;
      existingEntry.violations = violations;
      existingEntry.totalMarks = totalMarks;
      existingEntry.submittedAt = new Date();
      await existingEntry.save();
    } else {
      const newEntry = new LeaderBoard({
        examId,
        student_mail,
        score,
        correct,
        incorrect,
        violations,
        totalMarks,
        submittedAt: new Date(),
      });
      await newEntry.save();
    }

    res.status(200).json({ message: "Leaderboard updated successfully" });
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getLeaderBoard,
  updateLeaderBoard,
};
