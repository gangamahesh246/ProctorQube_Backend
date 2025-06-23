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
const login = require("./routers/LoginRouter");

const onlineStudents = new Map();

const app = express();
const server = createServer(app);

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
app.use("/", login);

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

  socket.on("assignExamToStudents", ({ studentEmails, examData, assignedBy }) => {
    studentEmails.forEach((email) => {
      const socketId = onlineStudents.get(email);
      if (socketId) {
        io.to(socketId).emit("examAssigned", examData, assignedBy);
        console.log(`Assigned exam to ${email}`);
      } else {
        console.log(`Student ${email} is not online.`);
      }
    });
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

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
