const Route = require("express").Router();
const {
  GetQuestions,
  PostOrUpdateQuestions,
  deleteCategory,
} = require("../controllers/questionController");
const { protectAdmin } = require("../middlewares/authMiddleware");

Route.get("/getquestions", protectAdmin, GetQuestions);
Route.post("/uploadquestions", protectAdmin, PostOrUpdateQuestions);
Route.delete("/deletecategory", protectAdmin, deleteCategory);

module.exports = Route;


