const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 30
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  categories: [{
    type: String,
    enum: ['technical', 'behavioral', 'cultural', 'leadership']
  }],
  customQuestions: [{
    text: String,
    timeLimit: { type: Number, default: 180 },
    category: String
  }],
  passingScore: {
    type: Number,
    default: 70
  },
  requiredSkills: [String],
  questions: [{
    id: Number,
    text: String,
    category: String,
    difficulty: String,
    timeLimit: Number,
    expectedAnswer: String,
    skillsToTest: [String]
  }],
  createdBy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  }
}, {
  timestamps: true
});

const InterviewResultSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  candidateInfo: {
    name: String,
    email: String,
    phone: String
  },
  answers: [{
    questionId: Number,
    questionText: String,
    answer: String,
    timeSpent: Number,
    isAutoSubmitted: Boolean,
    score: Number,
    feedback: String,
    strengths: [String],
    improvements: [String]
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  evaluation: {
    summary: String,
    strengths: [String],
    improvements: [String],
    recommendation: String,
    skillsAssessment: [{
      skill: String,
      score: Number,
      feedback: String
    }]
  },
  status: {
    type: String,
    enum: ['passed', 'failed', 'pending'],
    default: 'pending'
  },
  completedAt: Date,
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = {
  Interview: mongoose.model('Interview', InterviewSchema),
  InterviewResult: mongoose.model('InterviewResult', InterviewResultSchema)
};