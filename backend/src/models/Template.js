const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  interviewType: { type: String, enum: ['technical', 'behavioral', 'mixed'], default: 'technical' },
  role: { type: String },
  techStack: [{ type: String }],
  description: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  duration: { type: Number, required: true },
  categories: [{ type: String, required: true }],
  categoryQuestions: {
    'technical': { type: Number, default: 3 },
    'behavioral': { type: Number, default: 2 },
    'problem-solving': { type: Number, default: 2 },
    'communication': { type: Number, default: 1 },
    'leadership': { type: Number, default: 1 },
    'cultural-fit': { type: Number, default: 1 }
  },
  totalQuestions: { type: Number, default: 0 },
  passingScore: { type: Number, required: true },
  customQuestions: [{
    question: String,
    category: String
  }],
  requirements: { type: String },
  aiPrompt: { type: String },
  questions: [{
    category: String,
    question: String,
    expectedAnswer: String,
    points: Number,
    difficulty: String
  }],
  createdBy: { type: String, default: 'HR User' },
  isActive: { type: Boolean, default: true },
  isDeployed: { type: Boolean, default: false }, // For public access
  expiresAt: { type: Date },
  validFor: { type: Number, default: 60 }, // minutes
  
  // Scheduling fields
  scheduledDate: { type: String },
  scheduledStartTime: { type: String },
  scheduledEndTime: { type: String },
  autoActivate: { type: Boolean, default: false },
  isScheduled: { type: Boolean, default: false },
  activatedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Template', templateSchema);