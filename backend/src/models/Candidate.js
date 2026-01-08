const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  phone: String,
  location: String,
  resumePath: String,
  appliedFor: String,
  templateId: String,
  completedTemplates: [String],
  skillDNA: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String
    },
    technicalSkills: Array,
    softSkills: Array,
    experience: Array,
    education: Array,
    projects: Array,
    overallScore: Number,
    learningVelocity: Number
  },
  interviewQuestions: Array,
  interviewResponses: Array,
  behaviorDNA: {
    stress_tolerance: Number,
    ownership_mindset: Number,
    team_collaboration: Number,
    communication_clarity: Number,
    problem_solving: Number,
    emotional_stability: Number,
    leadership_potential: Number,
    behavior_profile: String,
    red_flags: Array,
    key_strengths: Array,
    overall_behavior_score: Number
  },
  eqAnalysis: {
    overallEQ: Number,
    breakdown: {
      voiceConfidence: Number,
      stressManagement: Number,
      communicationClarity: Number,
      emotionalIntelligence: Number,
      consistency: Number
    },
    insights: Array
  },
  personality: {
    mbti: String,
    ocean: {
      openness: Number,
      conscientiousness: Number,
      extraversion: Number,
      agreeableness: Number,
      neuroticism: Number
    },
    traits: {
      leadership: Number,
      teamOrientation: Number,
      riskTaking: Number,
      analytical: Number,
      creative: Number
    },
    workStyle: String,
    bestFitRoles: Array
  },
  hiringProbability: {
    score: Number,
    breakdown: Object,
    predictions: Object,
    recommendation: String,
    reasons: Array
  },
  interviewSummary: {
    summary: String,
    strengths: Array,
    weaknesses: Array,
    recommendedRole: String,
    verdict: String,
    keyInsights: Array,
    nextSteps: Array
  },
  answerQualityAnalysis: Array,
  cultureFit: {
    values_alignment: Number,
    team_fit: Number,
    overall_fit_score: Number
  },
  proctoringData: {
    cameraEnabled: Boolean,
    microphoneEnabled: Boolean,
    screenShared: Boolean,
    violations: Array,
    voiceMetrics: Object
  },
  status: {
    type: String,
    enum: ['pending', 'analyzing', 'interview', 'completed', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Candidate', candidateSchema);