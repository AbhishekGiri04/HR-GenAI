const express = require('express');
const router = express.Router();
const { Interview, InterviewResult } = require('../models/Interview');
const Candidate = require('../models/Candidate');
const questionGenerator = require('../ai-engines/intelligent-question-generator');
const aiEvaluator = require('../ai-engines/ai-evaluation-engine');

// HR Routes - Create and manage interviews
router.post('/interviews', async (req, res) => {
  try {
    const { title, jobTitle, duration, difficulty, categories, customQuestions, passingScore, requiredSkills } = req.body;
    
    const interview = new Interview({
      title,
      jobTitle: jobTitle || title,
      duration,
      difficulty,
      categories,
      customQuestions: customQuestions || [],
      passingScore: passingScore || 70,
      requiredSkills: requiredSkills || [],
      createdBy: 'HR', // In production, use actual user ID
      questions: [] // Will be generated per candidate
    });
    
    await interview.save();
    
    res.json({
      success: true,
      interview: interview,
      candidateLink: `/candidate-interview/${interview._id}`
    });
  } catch (error) {
    console.error('Failed to create interview:', error);
    res.status(500).json({ error: 'Failed to create interview' });
  }
});

// Get all interviews for HR
router.get('/interviews', async (req, res) => {
  try {
    const interviews = await Interview.find().sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

// Get interview results
router.get('/interview-results/:interviewId', async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findById(interviewId);
    const results = await InterviewResult.find({ interviewId }).populate('candidateId');
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    const stats = {
      totalCandidates: results.length,
      averageScore: results.length > 0 ? 
        Math.round(results.reduce((sum, r) => sum + (r.overallScore || 0), 0) / results.length) : 0,
      passRate: results.length > 0 ? 
        Math.round(results.filter(r => (r.overallScore || 0) >= interview.passingScore).length / results.length * 100) : 0
    };
    
    res.json({ interview, results, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interview results' });
  }
});

// Candidate Routes - Get interview for specific candidate
router.get('/candidate/interview/:interviewId/:candidateId', async (req, res) => {
  try {
    const { interviewId, candidateId } = req.params;
    
    const interview = await Interview.findById(interviewId);
    const candidate = await Candidate.findById(candidateId);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    // Generate personalized questions based on candidate's profile
    const questions = await questionGenerator.generateQuestionsForCandidate(candidate, {
      categories: interview.categories,
      difficulty: interview.difficulty,
      duration: interview.duration,
      customQuestions: interview.customQuestions,
      jobTitle: interview.jobTitle
    });
    
    // Return interview with personalized questions
    res.json({
      id: interview._id,
      title: interview.title,
      jobTitle: interview.jobTitle,
      duration: interview.duration,
      difficulty: interview.difficulty,
      passingScore: interview.passingScore,
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        category: q.category,
        difficulty: q.difficulty,
        timeLimit: q.timeLimit || 180,
        skillsToTest: q.skillsToTest || []
      })),
      candidateInfo: {
        name: candidate.name,
        email: candidate.email,
        skills: candidate.skillDNA?.technicalSkills || []
      }
    });
  } catch (error) {
    console.error('Failed to get candidate interview:', error);
    res.status(500).json({ error: 'Failed to load interview' });
  }
});

// Submit interview answers with AI evaluation
router.post('/candidate/submit-interview', async (req, res) => {
  try {
    const { interviewId, candidateId, answers, completedAt } = req.body;
    
    const interview = await Interview.findById(interviewId);
    const candidate = await Candidate.findById(candidateId);
    
    if (!interview || !candidate) {
      return res.status(404).json({ error: 'Interview or candidate not found' });
    }
    
    // Evaluate each answer using AI
    const evaluatedAnswers = [];
    let totalScore = 0;
    
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const evaluation = await questionGenerator.evaluateAnswer(
        answer.question,
        answer.answer,
        candidate.skillDNA?.technicalSkills || []
      );
      
      evaluatedAnswers.push({
        questionId: answer.questionId,
        questionText: answer.question.text,
        answer: answer.answer,
        timeSpent: answer.timeSpent,
        isAutoSubmitted: answer.isAutoSubmitted,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements
      });
      
      totalScore += evaluation.score;
    }
    
    const overallScore = Math.round((totalScore / answers.length) * 10); // Convert to 0-100 scale
    
    // Generate overall evaluation
    const overallEvaluation = await generateOverallEvaluation(evaluatedAnswers, candidate, interview);
    
    const result = new InterviewResult({
      interviewId,
      candidateId,
      candidateInfo: {
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone
      },
      answers: evaluatedAnswers,
      overallScore,
      evaluation: overallEvaluation,
      status: overallScore >= interview.passingScore ? 'passed' : 'failed',
      completedAt: new Date(completedAt),
      submittedAt: new Date()
    });
    
    await result.save();
    
    // Update candidate with interview result
    await Candidate.findByIdAndUpdate(candidateId, {
      $push: {
        interviewResults: {
          interviewId,
          score: overallScore,
          status: result.status,
          completedAt: result.completedAt
        }
      }
    });
    
    res.json({
      success: true,
      score: overallScore,
      status: result.status,
      evaluation: overallEvaluation,
      message: `Interview completed. Score: ${overallScore}%`
    });
  } catch (error) {
    console.error('Failed to submit interview:', error);
    res.status(500).json({ error: 'Failed to submit interview' });
  }
});

// Generate overall evaluation
async function generateOverallEvaluation(answers, candidate, interview) {
  try {
    const strengths = [];
    const improvements = [];
    const skillsAssessment = [];
    
    // Aggregate feedback from all answers
    answers.forEach(answer => {
      strengths.push(...answer.strengths);
      improvements.push(...answer.improvements);
    });
    
    // Remove duplicates and get top items
    const uniqueStrengths = [...new Set(strengths)].slice(0, 5);
    const uniqueImprovements = [...new Set(improvements)].slice(0, 5);
    
    // Assess technical skills
    const candidateSkills = candidate.skillDNA?.technicalSkills || [];
    candidateSkills.forEach(skill => {
      const skillAnswers = answers.filter(a => 
        a.questionText.toLowerCase().includes(skill.toLowerCase())
      );
      
      if (skillAnswers.length > 0) {
        const avgScore = skillAnswers.reduce((sum, a) => sum + a.score, 0) / skillAnswers.length;
        skillsAssessment.push({
          skill,
          score: Math.round(avgScore),
          feedback: avgScore >= 7 ? `Strong knowledge in ${skill}` : `Needs improvement in ${skill}`
        });
      }
    });
    
    const avgScore = answers.reduce((sum, a) => sum + a.score, 0) / answers.length;
    let recommendation = 'Needs significant improvement';
    
    if (avgScore >= 8) recommendation = 'Excellent - Highly recommended for hire';
    else if (avgScore >= 7) recommendation = 'Good - Recommended for hire';
    else if (avgScore >= 6) recommendation = 'Average - Consider for next round';
    else if (avgScore >= 5) recommendation = 'Below average - Additional training needed';
    
    return {
      summary: `Candidate completed ${interview.title} with ${Math.round(avgScore * 10)}% performance. ${recommendation}`,
      strengths: uniqueStrengths,
      improvements: uniqueImprovements,
      recommendation,
      skillsAssessment
    };
  } catch (error) {
    console.error('Evaluation generation error:', error);
    return {
      summary: 'Interview completed',
      strengths: ['Participated in interview'],
      improvements: ['Continue learning'],
      recommendation: 'Review performance',
      skillsAssessment: []
    };
  }
}

module.exports = router;