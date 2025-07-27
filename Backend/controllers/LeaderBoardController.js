const LeaderBoard = require('../models/LeaderBoard');

const getLeaderBoard = async (req, res) => {
    try {
        const leaderBoard = await LeaderBoard.find().sort({ score: -1 }); 
        if (!leaderBoard || leaderBoard.length === 0) {
            return res.status(404).json({ message: "Leaderboard not found" });
        }
        res.status(200).json(leaderBoard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const updateLeaderBoard = async (req, res) => {
    const { student_mail, technology, score } = req.body;   
    try {
        const existingEntry = await LeaderBoard.findOne({ student_mail, technology });
        if (existingEntry) {
            existingEntry.score = score;
            await existingEntry.save();
        } else {
            const newEntry = new LeaderBoard({ student_mail, technology, score });
            await newEntry.save();
        }
        res.status(200).json({ message: "Leaderboard updated successfully" });
    } catch (error) {
        console.error("Error updating leaderboard:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { getLeaderBoard, updateLeaderBoard };