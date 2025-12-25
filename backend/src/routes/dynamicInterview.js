const express = require('express');
const InterviewAIEngine = require('../ai-engines/InterviewAIEngine');
const Candidate = require('../models/Candidate');
const Template = require('../models/Template');
const router = express.Router();

const aiEngine = new InterviewAIEngine();

// Dynamic interview configuration
router.post('/configure', async (req, res) => {
  try {
    const config = req.body;
    const interviewStructure = await aiEngine.configureInterview(config);
    
    // Save as template
    const template = new Template({
      ...config,
      structure: interviewStructure,
      createdBy: 'AI-Generated',
      isActive: true
    });
    
    await template.save();
    res.json({ template, structure: interviewStructure });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced resume parsing
router.post('/parse-resume', async (req, res) => {
  try {
    const { resumeText, candidateId } = req.body;
    
    // AI-powered resume parsing
    const candidateProfile = await aiEngine.parseResume(resumeText);
    
    // Update candidate with AI analysis
    await Candidate.findByIdAndUpdate(candidateId, {
      aiProfile: candidateProfile,
      skillDNA: {
        ...candidateProfile,
        overallScore: 0, // Will be calculated after interview
        analysisDate: new Date()
      }
    });
    
    res.json({ candidateProfile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smart template matching
router.post('/match-templates/:candidateId', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);
    const templates = await Template.find({ isActive: true });
    
    const matches = await aiEngine.matchTemplates(
      candidate.aiProfile || candidate.skillDNA,
      templates
    );
    
    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate unique questions per candidate
router.post('/generate-questions/:candidateId/:templateId', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);
    const template = await Template.findById(req.params.templateId);
    
    const techStack = candidate.skillDNA?.technicalSkills || candidate.aiProfile?.primaryTechStack || [];
    
    // Generate unique questions for this candidate
    const questions = await aiEngine.generateQuestions(
      req.params.candidateId,
      techStack,
      template.structure || { name: template.name, questionCount: template.questions?.length || 5 },
      template.difficulty
    );
    
    // Ensure fairness and uniqueness
    const fairnessCheck = await aiEngine.ensureFairness(
      req.params.candidateId,
      questions,
      [] // TODO: Get previous questions from database
    );
    
    res.json({ questions, fairnessCheck });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Real-time interviewer responses
router.post('/interviewer-response', async (req, res) => {
  try {
    const { context, candidateAnswer, questionData } = req.body;
    
    const response = await aiEngine.getInterviewerResponse(
      context,
      candidateAnswer,
      questionData
    );
    
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Evaluate candidate answers
router.post('/evaluate-answer', async (req, res) => {
  try {
    const { question, candidateAnswer, expectedAnswer, voiceMetrics } = req.body;
    
    const evaluation = await aiEngine.evaluateAnswer(
      question,
      candidateAnswer,
      expectedAnswer,
      voiceMetrics
    );
    
    res.json({ evaluation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate final genome profile
router.post('/generate-genome/:candidateId', async (req, res) => {
  try {
    const { interviewData } = req.body;
    const candidate = await Candidate.findById(req.params.candidateId);
    
    const genomeProfile = await aiEngine.generateGenomeProfile(
      interviewData,
      candidate.aiProfile || candidate.skillDNA
    );
    
    // Update candidate with genome profile
    await Candidate.findByIdAndUpdate(req.params.candidateId, {
      genomeProfile,
      skillDNA: {
        ...candidate.skillDNA,
        overallScore: genomeProfile.finalScore,
        lastUpdated: new Date()
      }
    });
    
    res.json({ genomeProfile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate HR summary report
router.post('/hr-summary/:candidateId', async (req, res) => {
  try {
    const { interviewResults } = req.body;
    const candidate = await Candidate.findById(req.params.candidateId);
    
    const hrSummary = await aiEngine.generateHRSummary(
      {
        name: candidate.name,
        email: candidate.email,
        profile: candidate.aiProfile || candidate.skillDNA
      },
      interviewResults
    );
    
    res.json({ hrSummary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;