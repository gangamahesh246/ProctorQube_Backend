const StudentExam = require("../models/StudentExam");
const Exam = require("../models/ExamModel");
const mongoose = require("mongoose");

const assignExamToStudent = async (req, res) => {
  const { studentId, examId, assignedBy } = req.body;

  try {
    let studentExam = await StudentExam.findOne({ student_id: studentId });

    const newExam = {
      examId,
      assignedBy,
      assignedAt: new Date(),
    };

    if (!studentExam) {
      studentExam = await StudentExam.create({
        student_id: studentId,
        exams: [newExam],
      });
    } else {
      studentExam.exams.push(newExam);
      await studentExam.save();
    }

    res
      .status(200)
      .json({ message: "Exam assigned successfully.", examData: newExam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to assign exam." });
  }
};

const getStudentExams = async (req, res) => {
  const { student_id } = req.query;

  if (
    !student_id ||
    typeof student_id !== "string" ||
    !mongoose.Types.ObjectId.isValid(student_id)
  ) {
    return res.status(400).json({ message: "Invalid student ID format" });
  }

  try {
    const data = await StudentExam.findOne({
      student_id: student_id,
    }).populate({
      path: "exams.examId",
      select:
        "basicInfo settings.availability settings.results.displayScore.enabled settings.examTakenTimes",
    });

    if (!data) {
      return res.json({ exams: [] });
    }

    res.json({ exams: data.exams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching exams" });
  }
};

const updateExamStatus = async (req, res) => {
  try {
    const { examId, studentId } = req.body;

    const attemptData = JSON.parse(req.body.attemptData || "{}");
    const {
      title,
      category,
      totalMarks,
      passMark,
      score,
      attemptStart,
      attemptEnd,
      timeTaken,
      duration,
      startTime,
      student_mail,
      endTime,
      violations = {},
    } = attemptData;

    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const examObjectId = new mongoose.Types.ObjectId(examId);

    const studentDoc = await StudentExam.findOne({
      student_id: studentObjectId,
      "exams.examId": examObjectId,
    });

    if (!studentDoc) {
      return res.status(404).json({ message: "Exam not found for student." });
    }

    const examEntry = studentDoc.exams.find((e) =>
      e.examId.equals(examObjectId)
    );

    if (!examEntry) {
      return res.status(404).json({ message: "Exam not found in record." });
    }

    const attemptCount = examEntry.attempts?.length || 0;
    const examModel = await mongoose.model("Exam").findById(examObjectId);
    const examTakenTimes = examModel?.settings?.examTakenTimes;

    const maxAttempts =
      examTakenTimes?.type === "multiple"
        ? Number(examTakenTimes.multiple)
        : examTakenTimes?.type === "one"
        ? 1
        : Infinity;

    if (attemptCount >= maxAttempts) {
      return res.status(403).json({ message: "Max attempts exceeded" });
    }

    let violationPhotos = [];
    if (req.files && req.files.length > 0) {
      violationPhotos = req.files.map(
        (file) => `/uploads/violations/${file.filename}`
      );
    }

    const isLastAttempt = attemptCount + 1 >= maxAttempts;
    const result = score >= passMark ? "pass" : "fail";

    const stats = {
      title: title?.trim(),
      subject: category,
      totalMarks,
      passMark,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      score,
      student_mail,
      attemptStart: new Date(attemptStart),
      attemptEnd: new Date(attemptEnd),
      timeTaken,
      violations,
      violationPhotos,
    };

    const updatePayload = {
      $set: {
        "exams.$.score": score,
        "exams.$.result": result,
        ...(isLastAttempt && { "exams.$.status": "completed" }),
      },
      $push: {
        "exams.$.attempts": {
          score,
          result,
          attemptStart: new Date(attemptStart),
          attemptEnd: new Date(attemptEnd),
          timeTaken,
          stats,
        },
      },
    };

    await StudentExam.updateOne(
      { student_id: studentObjectId, "exams.examId": examObjectId },
      updatePayload
    );

    return res.status(200).json({
      message: isLastAttempt
        ? "Final attempt submitted. Exam marked as completed."
        : `Attempt ${attemptCount + 1}/${maxAttempts} submitted.`,
    });
  } catch (err) {
    console.error("Error submitting exam:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const setStatus = async (req, res) => {
  const { examId, status, student_id } = req.body;

  if (
    !student_id ||
    typeof student_id !== "string" ||
    !mongoose.Types.ObjectId.isValid(student_id)
  ) {
    return res.status(400).json({ message: "Invalid student ID format" });
  }

  try {
    const update = await StudentExam.updateOne(
      {
        student_id: new mongoose.Types.ObjectId(student_id),
        "exams.examId": examId,
      },
      { $set: { "exams.$.status": status } }
    );

    if (update.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Exam not found or already updated." });
    }

    return res.status(200).json({ message: "Status updated successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update exam status." });
  }
};

const getStudentExamStats = async (req, res) => {
  const { student_id } = req.query;

  if (
    !student_id ||
    typeof student_id !== "string" ||
    !mongoose.Types.ObjectId.isValid(student_id)
  ) {
    return res.status(400).json({ message: "Invalid student ID format" });
  }

  try {
    const data = await StudentExam.findOne({
      student_id: new mongoose.Types.ObjectId(student_id),
    });

    if (!data || !Array.isArray(data.exams)) {
      return res.json({ examStats: {} });
    }

    const examsData = data.exams;

    const scores = [];
    const allAttempts = [];
    let passed = 0;
    let failed = 0;

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);

    let currentWeekExams = 0;
    let previousWeekExams = 0;
    let currentWeekScores = [];
    let previousWeekScores = [];

    let totalFlags = 0;

    examsData.forEach((exam) => {
      const attempts = exam.attempts || [];
      allAttempts.push(...attempts);

      attempts.forEach((a) => {
        if (a?.attemptStart) {
          const attemptTime = new Date(a.attemptStart);
          if (attemptTime >= oneWeekAgo && attemptTime < now) {
            currentWeekExams++;
            if (typeof a?.score === "number") currentWeekScores.push(a.score);
          } else if (attemptTime >= twoWeeksAgo && attemptTime < oneWeekAgo) {
            previousWeekExams++;
            if (typeof a?.score === "number") previousWeekScores.push(a.score);
          }
        }

        if (a?.result === "pass") passed++;
        if (a?.result === "fail") failed++;

        if (typeof a?.score === "number") scores.push(a.score);

        const v = a?.stats?.violations;
        if (v) {
          totalFlags +=
            (v.tabSwitchingViolation || 0) +
            (v.webcamViolation || 0) +
            (v.soundViolation || 0) +
            (v.devtoolsViolation || 0) +
            (v.rightClickViolation || 0) +
            (v.fullscreenViolation || 0);
        }
      });
    });

    const averageMarks = scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
      : 0;

    const highestMarks = scores.length ? Math.max(...scores) : 0;
    const lowestMarks = scores.length ? Math.min(...scores) : 0;

    const recentAttempts = allAttempts
      .filter((a) => a?.attemptStart)
      .sort((a, b) => new Date(b.attemptStart) - new Date(a.attemptStart))
      .slice(0, 5);

    const recentScores = recentAttempts
      .map((a) => a.score)
      .filter((s) => typeof s === "number");

    const recentAccuracy = recentScores.length
      ? (recentScores.reduce((a, b) => a + b, 0) / recentScores.length).toFixed(
          2
        )
      : 0;

    const totalExams = examsData.length;
    const attemptedExams = allAttempts.length;

    const passPercentage =
      totalExams === 0 ? 0 : ((passed / allAttempts.length) * 100).toFixed(2);

    const performanceTrend = examsData
      .filter((exam) =>
        (exam.attempts || []).some((a) => typeof a.score === "number")
      )
      .map((exam) => {
        const latestAttempt = [...(exam.attempts || [])]
          .filter((a) => typeof a.score === "number")
          .sort(
            (a, b) => new Date(b.attemptStart) - new Date(a.attemptStart)
          )[0];

        return {
          label: latestAttempt?.stats?.title ?? "Unknown",
          value: latestAttempt?.score ?? 0,
          date: latestAttempt?.attemptStart
            ? new Date(latestAttempt.attemptStart).toISOString().slice(0, 10)
            : null,
        };
      });

    const sortedExams = [...examsData].sort((a, b) => {
      const aTime = new Date(a.attempts?.at(-1)?.attemptStart || 0);
      const bTime = new Date(b.attempts?.at(-1)?.attemptStart || 0);
      return bTime - aTime;
    });

    const recentExams = sortedExams.slice(0, 5);

    const scoreDistribution = [];

    recentExams.forEach((exam) => {
      const latestAttempt = [...(exam.attempts || [])]
        .filter((a) => typeof a.score === "number")
        .sort((a, b) => new Date(b.attemptStart) - new Date(a.attemptStart))[0];

      if (latestAttempt) {
        scoreDistribution.push({
          label: latestAttempt?.stats?.title ?? "Unknown",
          value: latestAttempt.score,
        });
      }
    });

    const violationSummary = {
      tabSwitch: 0,
      cameraOff: 0,
      audioIssues: 0,
    };

    examsData.forEach((exam) => {
      exam.attempts?.forEach((attempt) => {
        const v = attempt?.stats?.violations;
        if (v) {
          violationSummary.tabSwitch += v.tabSwitchingViolation || 0;
          violationSummary.cameraOff += v.webcamViolation || 0;
          violationSummary.audioIssues += v.soundViolation || 0;
        }
      });
    });

    const violationDistribution = [
      { label: "Tab Switch", value: violationSummary.tabSwitch },
      { label: "Camera Off", value: violationSummary.cameraOff },
      { label: "Audio Issues", value: violationSummary.audioIssues },
    ];

    const timeVsDuration = [];

    recentExams.forEach((exam) => {
      const lastAttempt = exam.attempts?.at(-1);
      const duration = lastAttempt?.stats?.duration;
      const title = lastAttempt?.stats?.title ?? "Untitled Exam";
      const timeTaken = exam.timeTaken ?? 0;

      if (duration && timeTaken) {
        timeVsDuration.push({
          label: title,
          value: Math.round((timeTaken / duration) * 100),
        });
      }
    });

    const completedExams = [];

    recentExams.forEach((exam) => {
      const lastAttempt = [...(exam.attempts || [])]
        .filter((a) => typeof a.score === "number")
        .sort((a, b) => new Date(b.attemptStart) - new Date(a.attemptStart))[0];

      if (!lastAttempt) return;

      const examTitle = lastAttempt?.stats?.title ?? "Untitled Exam";
      const faculty = exam.assignedBy;
      const id = exam.examId;
      const date = exam.assignedAt
        ? new Date(exam.assignedAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "";
      const proctorAlerts = lastAttempt?.stats?.violations
        ? Object.values(lastAttempt.stats.violations).reduce(
            (sum, val) => sum + (val || 0),
            0
          )
        : 0;
      const time = exam.activeTime ?? "";
      const score = lastAttempt.score;
      const status = lastAttempt.result ?? "Not Attempted";

      completedExams.push({
        examTitle,
        faculty,
        date,
        time,
        id,
        score,
        status,
        proctorAlerts,
      });
    });

    const examsHistory = [];

    examsData.forEach((exam) => {
      const lastAttempt = [...(exam.attempts || [])]
        .filter((a) => typeof a.score === "number")
        .sort((a, b) => new Date(b.attemptStart) - new Date(a.attemptStart))[0];

      if (!lastAttempt) return;

      const examName = lastAttempt?.stats?.title ?? "Untitled Exam";
      const date = exam.assignedAt
        ? new Date(exam.assignedAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "";
      const proctorAlerts = lastAttempt?.stats?.violations
        ? Object.values(lastAttempt.stats.violations).reduce(
            (sum, val) => sum + (val || 0),
            0
          )
        : 0;
      const score = lastAttempt.score;
      const status = lastAttempt.result ?? "Not Attempted";

      examsHistory.push({
        examName,
        date,
        score,
        status,
        proctorAlerts,
      });
    });

    const formatTo12Hour = (time24) => {
      if (!time24) return "N/A";
      const [hour, minute] = time24.split(":");
      const h = parseInt(hour, 10);
      const suffix = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12.toString().padStart(2, "0")}:${minute} ${suffix}`;
    };

    const examIds = examsData.map((exam) => exam.examId).filter(Boolean);

    const fetchedExams = await Exam.find({ _id: { $in: examIds } });

    const upcomingExams = fetchedExams
      .map((exam) => {
        const assigned = examsData.find(
          (ex) => ex.examId?.toString() === exam._id?.toString()
        );

        const startDate = new Date(
          exam.settings?.availability?.timeLimitDays?.from
        );

        const startTime = exam.settings?.availability?.timeLimitHours?.from
          ? new Date(
              startDate.toDateString() +
                " " +
                exam.settings?.availability?.timeLimitHours?.from
            )
          : startDate;

        const now = new Date();

        const isCompleted = assigned?.status === "completed";
        if (isCompleted) return null;

        const examStart = startTime;
        const examEnd = new Date(
          examStart.getTime() +
            (exam.settings?.answerTimeControl?.examTime || 0) * 60 * 1000
        );
        const hoursUntilStart = (examStart - now) / (1000 * 60 * 60); // in hours
        const hasStarted = now >= examStart;
        const hasEnded = now >= examEnd;

        return {
          examTitle: exam.basicInfo?.title || "Upcoming Exam",
          date: startDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          time: formatTo12Hour(
            exam.settings?.availability?.timeLimitHours?.from
          ),
          hoursUntil: hoursUntilStart,
          faculty: assigned?.assignedBy || "Unknown",
          duration: exam.settings?.answerTimeControl?.examTime / 60 || 0,
          hasStarted,
          hasEnded,
          startTime, 
        };
      })
      .filter(Boolean); 

    const examStats = {
      totalExams,
      attemptedExams,
      examsPassed: passed,
      examsFailed: failed,
      averageMarks,
      passPercentage,
      highestMarks,
      lowestMarks,
      recentAccuracy,
    };

    const trends = {
      examsCompleted: {
        value: currentWeekExams - previousWeekExams,
        isPositive: currentWeekExams >= previousWeekExams,
      },
      averageScore: {
        value:
          currentWeekScores.length && previousWeekScores.length
            ? (
                currentWeekScores.reduce((a, b) => a + b, 0) /
                  currentWeekScores.length -
                previousWeekScores.reduce((a, b) => a + b, 0) /
                  previousWeekScores.length
              ).toFixed(2)
            : 0,
        isPositive:
          currentWeekScores.reduce((a, b) => a + b, 0) /
            (currentWeekScores.length || 1) >=
          previousWeekScores.reduce((a, b) => a + b, 0) /
            (previousWeekScores.length || 1),
      },
      totalFlags: {
        value: totalFlags,
        isPositive: false,
      },
    };

    return res.json({
      examStats,
      trends,
      performanceTrend,
      violationDistribution,
      upcomingExams,
      scoreDistribution,
      timeVsDuration,
      completedExams,
      examsHistory,
    });
  } catch (err) {
    console.error("Error fetching student exam stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const GetAttempts = async (req, res) => {
  let { student_id, examId } = req.query;

  if (!Array.isArray(student_id)) {
    student_id = [student_id];
  }

  if (!examId || typeof examId !== "string") {
    return res.status(400).json({ message: "Missing or invalid examId" });
  }

  const validIds = student_id.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  if (validIds.length === 0) {
    return res.status(400).json({ message: "No valid student IDs provided" });
  }

  try {
    const data = await StudentExam.find({
      student_id: {
        $in: validIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    });

    const results = validIds.map((id) => {
      const studentData = data.find((doc) => doc.student_id.toString() === id);

      if (studentData) {
        const matchedExam = studentData.exams.find(
          (exam) => exam.examId.toString() === examId
        );

        if (matchedExam && matchedExam.attempts?.length > 0) {
          return {
            student_id: id,
            lastAttemptStats: matchedExam.attempts.at(-1).stats || null,
          };
        }

        return {
          student_id: id,
          lastAttemptStats: null,
        };
      } else {
        return {
          student_id: id,
          lastAttemptStats: null,
        };
      }
    });

    return res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching attempts:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const GlobalRank = async (req, res) => {
  const { student_id, rank, totalstudents } = req.body;

  if (
    !student_id ||
    typeof rank !== "number" ||
    typeof totalstudents !== "number"
  ) {
    return res.status(400).json({
      message:
        "student_id, numeric rank, and numeric totalstudents are required",
    });
  }

  try {
    const updated = await StudentExam.findOneAndUpdate(
      { student_id },
      {
        $set: {
          globalrank: rank,
          totalstudents: totalstudents,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Global rank and total students updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error in GlobalRank controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getGlobalRank = async (req, res) => {
  const { student_id } = req.query;

  if (!student_id) {
    return res.status(400).json({ message: "student_id is required" });
  }

  try {
    const studentExam = await StudentExam.findOne({ student_id });

    if (!studentExam) {
      return res.status(404).json({ message: "StudentExam record not found" });
    }

    res.status(200).json({
      message: "Global rank fetched successfully",
      globalrank: studentExam.globalrank,
      totalstudents: studentExam.totalstudents,
    });
  } catch (error) {
    console.error("Error fetching global rank:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  assignExamToStudent,
  getStudentExams,
  updateExamStatus,
  setStatus,
  getStudentExamStats,
  GetAttempts,
  GlobalRank,
  getGlobalRank,
};
