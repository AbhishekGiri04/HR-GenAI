const Candidate = require('../models/Candidate');
const adaptiveInterviewer = require('../ai-engines/adaptive-interviewer');
const voiceEmotionAnalyzer = require('../ai-engines/voice-emotion-analyzer');
const emailService = require('../services/emailService');

exports.analyzeResume = async (req, res) => {
  try {
    const { candidateId, resumeText } = req.body;
    
    const aiResponse = await axios.post('http://localhost:8000/analyze-resume', {
      text: resumeText
    });

    const candidate = await Candidate.findById(candidateId);
    candidate.skillDNA = aiResponse.data.skill_dna;
    await candidate.save();

    res.json({ success: true, skillDNA: aiResponse.data.skill_dna });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

exports.analyzeInterview = async (req, res) => {
  try {
    const { candidateId, responses, proctoringData, voiceMetrics, confidenceTimeline } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Save responses
    candidate.interviewResponses = responses;
    if (proctoringData) {
      candidate.proctoringData = {
        ...proctoringData,
        voiceMetrics,
        confidenceTimeline
      };
    }

    // Analyze each answer quality
    const answerAnalysis = [];
    for (const response of responses) {
      const analysis = await adaptiveInterviewer.analyzeAnswerQuality(
        response.answer,
        response.question
      );
      answerAnalysis.push(analysis);
    }

    // Voice emotion analysis
    const voiceAnalysis = voiceEmotionAnalyzer.analyzeVoiceMetrics(voiceMetrics);
    
    // Text emotion analysis
    const textEmotions = await voiceEmotionAnalyzer.analyzeTextEmotion(
      responses.map(r => r.answer).join(' ')
    );

    // Generate EQ Score
    const eqScore = voiceEmotionAnalyzer.generateEQScore(
      voiceAnalysis,
      textEmotions,
      responses
    );

    // Personality detection
    const personality = await adaptiveInterviewer.detectPersonality(responses);

    // Hiring probability
    const hiringProb = await adaptiveInterviewer.generateHiringProbability({
      ...candidate.toObject(),
      answerAnalysis,
      eqScore,
      personality
    });

    // Interview summary
    const summary = await adaptiveInterviewer.generateInterviewSummary(
      candidate,
      responses
    );

    // Generate behavior DNA
    const behaviorDNA = {
      stress_tolerance: 10 - voiceAnalysis.stress,
      team_collaboration: personality?.traits?.teamOrientation || 7,
      problem_solving: personality?.traits?.analytical || 8,
      communication_clarity: voiceAnalysis.clarity,
      leadership_potential: personality?.traits?.leadership || 7
    };

    // Save everything
    candidate.behaviorDNA = behaviorDNA;
    candidate.eqAnalysis = eqScore;
    candidate.personality = personality;
    candidate.hiringProbability = hiringProb;
    candidate.interviewSummary = summary;
    candidate.answerQualityAnalysis = answerAnalysis;
    candidate.status = 'completed';
    await candidate.save();

    // Send email to candidate
    try {
      await emailService.sendInterviewCompletionEmail(candidate, summary);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({ 
      success: true, 
      behaviorDNA,
      eqScore,
      personality,
      hiringProbability: hiringProb,
      summary
    });
  } catch (error) {
    console.error('Interview analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
};

exports.generateFollowUp = async (req, res) => {
  try {
    const { answer, question, candidateId } = req.body;
    
    const candidate = await Candidate.findById(candidateId);
    const followUp = await adaptiveInterviewer.generateFollowUpQuestion(
      answer,
      question,
      candidate.skillDNA
    );

    res.json({ success: true, followUp });
  } catch (error) {
    console.error('Follow-up generation error:', error);
    res.status(500).json({ error: 'Failed to generate follow-up' });
  }
};

exports.getAnalysis = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);
    res.json({
      skillDNA: candidate.skillDNA,
      behaviorDNA: candidate.behaviorDNA
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
};