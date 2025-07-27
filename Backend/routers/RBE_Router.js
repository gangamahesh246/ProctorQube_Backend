const express = require("express");
const { protectStudent } = require("../middlewares/authMiddleware");
const { getLeaderBoard, updateLeaderBoard } = require("../controllers/RBE_Controller");

const Route = express.Router();

Route.get("/getLeaderBoardbyexam", getLeaderBoard);
Route.post("/updateLeaderBoardbyexam", protectStudent, updateLeaderBoard);

module.exports = Route;