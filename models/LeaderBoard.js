const mongoose = require('mongoose');

const LeaderBoardSchema = new mongoose.Schema({
    student_mail: { type: String, required: true },
    technology: { type: String, required: true },
    score: { type: Number },
})

module.exports = mongoose.model('LeaderBoard', LeaderBoardSchema);