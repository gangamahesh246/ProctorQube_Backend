const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/database");
connectDB();
const exam = require("./routers/ExamRouter");
const question = require("./routers/questionRoute");
const student = require("./routers/studentsRoute");
const profile = require("./routers/profileRouter");

const studentProfile = require("./routers/userProfileRouter");
const login = require("./routers/LoginRouter");
const getStudentExams = require("./routers/StudentExamRoutes");
const Student = require("./models/studentsModel");
const StudentExam = require("./models/StudentExam");
const interviewQuestion = require("./routers/interviewQuestionRoutes")
const studentDashboardRoutes = require('./routers/studentDashboardRoutes');
const practiceTestRoutes = require('./routers/practiceTestRoutes');


const onlineStudents = new Map();

const app = express();
const server = createServer(app);


const port = 3000 || 3001
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

app.use("/", exam);
app.use("/", question);
app.use("/", student);
app.use("/", profile);

app.use("/", studentProfile);
app.use("/", login);
app.use("/", getStudentExams);
app.use("/", interviewQuestion);
app.use("/", studentDashboardRoutes);
app.use("/", practiceTestRoutes);



const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("registerStudent", (email) => {
    console.log(`Student registered: ${email} => ${socket.id}`);
    onlineStudents.set(email, socket.id);
  });

  socket.on(
    "assignExamToStudents",
    async ({ studentEmails, examData, assignedBy }) => {
      for (const email of studentEmails) {
        try {
          const student = await Student.findOne({ student_mail: email });
          if (!student) {
            console.log(`Student with email ${email} not found`);
            continue;
          }
          const socketId = onlineStudents.get(email);
          if (socketId) {
            socket.to(socketId).emit("examAssigned", examData, assignedBy);
            console.log(`Sent exam assignment to ${email}`);
          } else {
            console.log(`Student ${email} is not online.`);
          }

          let studentExam = await StudentExam.findOne({
            student_id: student._id,
          });

          if (!studentExam) {
            studentExam = new StudentExam({
              student_id: student._id,
              exams: [],
            });
          }

          studentExam.exams.push({
            examId: examData._id,
            assignedBy,
          });

          await studentExam.save();
          console.log(`Stored exam assignment in DB for ${email}`);
        } catch (err) {
          console.error(`Error processing student ${email}:`, err.message);
        }
      }
    }
  );

socket.on("deleteExamFromStudents", async ({ examId }) => {
  try {
    await StudentExam.updateMany(
      { "exams.examId": examId },
      { $pull: { exams: { examId: examId } } }
    );
    io.emit("examDeleted", { examId });
    console.log(`Exam ${examId} removed from all students`);
  } catch (err) {
    console.error("Error removing exam from students:", err);
  }
});


socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    for (let [email, id] of onlineStudents.entries()) {
      if (id === socket.id) {
        onlineStudents.delete(email);
        break;
      }
    }
  });
});


server.listen(port, () => {
  console.log("Server is running on http://localhost:3000");
});
