const mongoose = require("mongoose");

const allowedDomains = ["@aec.edu.in", "@acet.ac.in", "@acoe.edu.in"];

const StudentSchema = new mongoose.Schema(
  {
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },

    student_mail: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (email) {
          return allowedDomains.some((domain) => email.endsWith(domain));
        },
        message:
          "Email must end with @aec.edu.in, @acet.ac.in, or @acoe.edu.in",
      },
    },

    technology: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Students", StudentSchema);
