const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// GET /api/debug/candidate/:id - Debug candidate data
router.get('/candidate/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        // Return detailed candidate data for debugging
        res.json({
            id: candidate._id,
            name: candidate.name,
            email: candidate.email,
            interviewCompleted: candidate.interviewCompleted,
            interviewScore: candidate.interviewScore,
            hasSkillDNA: !!candidate.skillDNA,
            hasEQAnalysis: !!candidate.eqAnalysis,
            hasBehaviorDNA: !!candidate.behaviorDNA,
            hasHiringProbability: !!candidate.hiringProbability,
            hasInterviewResponses: !!(candidate.interviewResponses?.length),
            skillDNAScore: candidate.skillDNA?.overallScore,
            eqScore: candidate.eqAnalysis?.overallEQ,
            behaviorScore: candidate.behaviorDNA?.overall_behavior_score,
            hiringScore: candidate.hiringProbability?.score,
            responseCount: candidate.interviewResponses?.length || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;