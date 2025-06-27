const PracticeTest = require('../models/PracticeTestFull');

// Create a new practice test
const createPracticeTest = async (req, res) => {
  const { title, duration, questions } = req.body;
  try {
    const newTest = new PracticeTest({ title, duration, questions });
    await newTest.save();
    res.status(201).json({ message: 'Practice test created', test: newTest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all tests
const getAllPracticeTests = async (req, res) => {
  try {
    const tests = await PracticeTest.find().select('title duration createdAt');
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get test by ID with questions
const getPracticeTestById = async (req, res) => {
  try {
    const test = await PracticeTest.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit answers
const submitPracticeTest = async (req, res) => {
  const { studentId, answers, startedAt, endedAt } = req.body;
  const testId = req.params.id;

  try {
    const test = await PracticeTest.findById(testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    let score = 0;
    const evaluatedAnswers = test.questions.map((q, i) => {
      const userAnswer = answers.find(a => a.question === q.question);
      const isCorrect = userAnswer?.selectedAnswer === q.correctAnswer;
      if (isCorrect) score++;
      return {
        question: q.question,
        selectedAnswer: userAnswer?.selectedAnswer || '',
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    });

    const result = {
      studentId,
      answers: evaluatedAnswers,
      score,
      startedAt,
      endedAt
    };

    test.results.push(result);
    await test.save();

    res.status(200).json({ message: 'Test submitted', score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a student's results
const getStudentResults = async (req, res) => {
  try {
    const test = await PracticeTest.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const studentResults = test.results.filter(
      r => r.studentId.toString() === req.params.studentId
    );

    res.json(studentResults);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPracticeTest,
  getAllPracticeTests,
  getPracticeTestById,
  submitPracticeTest,
  getStudentResults
};
