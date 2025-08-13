const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          validate: {
            validator: function (v) {
              return v.length >= 2;
            },
            message: "At least two options are required.",
          },
          required: true,
        },
        multiple_response: {
          type: Boolean,
          default: false,
        },
        correct: {
          type: [String],
          required: true,
          validate: {
            validator: function (arr) {
              return arr.every((ans) =>
                ["A", "B", "C", "D", "E"].includes(ans.toUpperCase())
              );
            },
            message: "Correct answers must be within A to D (or E if extended).",
          },
        },
        marks: {
          type: Number,
          default: 1,
        },
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Question", QuestionSchema);
