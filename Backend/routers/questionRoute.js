const Route = require("express").Router();
const {
  GetQuestions,
  PostOrUpdateQuestions,
  deleteCategory,
} = require("../controllers/questionController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

Route.get("/getquestions", protect, adminOnly, GetQuestions);
Route.post("/uploadquestions", protect, adminOnly, PostOrUpdateQuestions);
Route.delete("/deletecategory", protect, adminOnly, deleteCategory);

module.exports = Route;


