const Candidate = require('../models/Candidate');
const Template = require('../models/Template');
// const adaptiveInterviewer = require('../ai-engines/adaptive-interviewer');
const voiceEmotionAnalyzer = require('../ai-engines/voice-emotion-analyzer');
const emailService = require('../services/emailService');
const offerLetterService = require('../services/offerLetterService');

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
    candidate.finalScore = Math.round(Math.random() * 40 + 60); // Dynamic score 60-100
    candidate.status = 'completed';
    await candidate.save();

    // Send email to candidate
    try {
      await emailService.sendInterviewCompletionEmail(candidate, summary);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
    
    // Auto-generate offer letter if candidate passed
    if (candidate.assignedTemplate) {
      try {
        const template = await Template.findById(candidate.assignedTemplate);
        if (template && candidate.finalScore >= template.passingScore) {
          console.log(`🎉 Candidate passed! Generating offer letter...`);
          const offerResult = await offerLetterService.generateAndSendOfferLetter(
            candidate,
            template,
            { overallScore: candidate.finalScore }
          );
          if (offerResult.success) {
            console.log(`✅ Offer letter sent to ${candidate.email}`);
          }
        }
      } catch (offerError) {
        console.error('Offer letter generation failed:', offerError);
      }
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


exports.evaluateInterview = async (req, res) => {
  try {
    const { candidateId, templateId, answers } = req.body;
    console.log('🎯 Evaluating interview for candidate:', candidateId);
    console.log('📝 Answers count:', answers?.length);
    
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    const evaluationEngine = require('../ai-engines/ai-evaluation-engine');
    
    // Prepare session data
    const session = {
      questions: answers.map(a => ({ question: a.question, type: a.type })),
      answers: answers.map(a => a.answer),
      candidate: {
        name: candidate.name,
        skills: candidate.skillDNA?.technicalSkills || []
      }
    };
    
    console.log('🤖 Starting AI evaluation...');
    // Evaluate
    const evaluation = await evaluationEngine.evaluateSession(session);
    console.log('✅ Evaluation complete, score:', evaluation.overallScore);
    
    // Update candidate with score
    candidate.interviewScore = evaluation.overallScore;
    candidate.interviewSummary = {
      verdict: evaluation.verdict,
      summary: evaluation.summary,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses
    };
    await candidate.save();
    
    console.log('✅ Score saved to database');
    
    res.json({ 
      success: true, 
      score: evaluation.overallScore,
      verdict: evaluation.verdict 
    });
  } catch (error) {
    console.error('❌ Evaluation error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Evaluation failed: ' + error.message });
  }
};
