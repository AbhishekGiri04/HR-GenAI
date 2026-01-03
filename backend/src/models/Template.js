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
  isDeployed: { type: Boolean, default: false },
  expiresAt: { type: Date },
  validFor: { type: Number, default: 60 },
  
  // Scheduling fields - for temporary templates
  scheduledDate: { type: String },
  scheduledStartTime: { type: String },
  scheduledEndTime: { type: String },
  autoActivate: { type: Boolean, default: false },
  isScheduled: { type: Boolean, default: false },
  isTemporary: { type: Boolean, default: false }, // Scheduled templates are temporary
  activatedAt: { type: Date },
  
  // Template type - permanent vs temporary
  templateType: { 
    type: String, 
    enum: ['permanent', 'scheduled'], 
    default: 'permanent' 
  }
}, {
  timestamps: true
});

// Auto-set template type based on scheduling
templateSchema.pre('save', function(next) {
  if (this.isScheduled && this.scheduledDate && this.scheduledStartTime && this.scheduledEndTime) {
    this.templateType = 'scheduled';
    this.isTemporary = true;
    this.isActive = false; // Scheduled templates start inactive
    this.isDeployed = false;
  } else {
    this.templateType = 'permanent';
    this.isTemporary = false;
  }
  next();
});

module.exports = mongoose.model('Template', templateSchema);