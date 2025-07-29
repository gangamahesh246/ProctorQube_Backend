const mongoose = require("mongoose");

const StudentsSchema = new mongoose.Schema(
  {
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    technology: {
      type: String,
      required: true,
    },
    students: [
      {
        student_mail: {
          type: String,
          required: true,
          validate: {
            validator: function (email) {
              const allowedDomains = [
                "@aec.edu.in",
                "@acet.ac.in",
                "@acoe.edu.in",
              ];

              return allowedDomains.some((domain) => email.endsWith(domain));
            },
            message:
              "Email must be a valid college email ending in @aec.edu.in, @acet.ac.in, or @acoe.edu.in.",
          },
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Students", StudentsSchema);
