const express = require('express');
const { protectStudent } = require('../middlewares/authMiddleware');
const Route = express.Router();

const { getLeaderBoard, updateLeaderBoard } = require('../controllers/LeaderBoardController');

Route.get('/leaderboard', protectStudent, getLeaderBoard);
Route.post('/updateleaderboard', protectStudent, updateLeaderBoard);

module.exports = Route;