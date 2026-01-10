const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const InterviewEvaluationService = require('../services/interviewEvaluationService');
const LetterGenerationService = require('../services/letterGenerationService');
const emailService = require('../services/emailService');
const path = require('path');

const evaluationService = new InterviewEvaluationService();
const letterService = new LetterGenerationService();

// POST /api/evaluation/evaluate/:candidateId - Evaluate candidate and send letter
router.post('/evaluate/:candidateId', async (req, res) => {
    try {
        const { candidateId } = req.params;
        const candidate = await Candidate.findById(candidateId).populate('assignedTemplate');

        if (!candidate) {
            return res.status(404).json({
                success: false,
                error: 'Candidate not found'
            });
        }

        // Evaluate candidate
        const evaluation = evaluationService.evaluateCandidate(candidate);

        // Update candidate with evaluation results
        await Candidate.findByIdAndUpdate(candidateId, {
            interviewScore: evaluation.interviewScore,
            growthPotential: evaluation.growthPotential,
            retentionScore: evaluation.retentionScore,
            interviewCompleted: true,
            status: 'completed',
            aiHireStatus: evaluation.passed ? 'offered' : 'rejected'
        });

        // Generate and send appropriate letter
        let letterResult;
        let emailSent = false;

        if (evaluation.passed) {
            // Generate offer letter
            letterResult = await letterService.generateOfferLetter(candidate);
            
            // Send offer email with PDF attachment
            emailSent = await emailService.sendOfferEmail(candidate, letterResult.filePath);
        } else {
            // Generate rejection letter
            letterResult = await letterService.generateRejectionLetter(candidate);
            
            // Send rejection email with PDF attachment
            emailSent = await emailService.sendRejectionEmail(candidate, letterResult.filePath);
        }

        res.json({
            success: true,
            data: {
                candidateId,
                evaluation,
                letterGenerated: true,
                letterPath: letterResult.filePath,
                emailSent,
                status: evaluation.passed ? 'offered' : 'rejected'
            },
            message: `Candidate evaluated and ${evaluation.passed ? 'offer' : 'rejection'} letter sent`
        });

    } catch (error) {
        console.error('Evaluation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to evaluate candidate'
        });
    }
});

// GET /api/evaluation/recalculate/:candidateId - Recalculate scores only
router.get('/recalculate/:candidateId', async (req, res) => {
    try {
        const { candidateId } = req.params;
        const candidate = await Candidate.findById(candidateId).populate('assignedTemplate');

        if (!candidate) {
            return res.status(404).json({
                success: false,
                error: 'Candidate not found'
            });
        }

        const evaluation = evaluationService.evaluateCandidate(candidate);

        // Update candidate with new scores
        await Candidate.findByIdAndUpdate(candidateId, {
            interviewScore: evaluation.interviewScore,
            growthPotential: evaluation.growthPotential,
            retentionScore: evaluation.retentionScore
        });

        res.json({
            success: true,
            data: evaluation
        });

    } catch (error) {
        console.error('Recalculation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to recalculate scores'
        });
    }
});

// POST /api/evaluation/batch-evaluate - Evaluate all pending candidates
router.post('/batch-evaluate', async (req, res) => {
    try {
        const candidates = await Candidate.find({
            interviewCompleted: true,
            interviewScore: { $exists: false }
        }).populate('assignedTemplate');

        const results = [];

        for (const candidate of candidates) {
            try {
                const evaluation = evaluationService.evaluateCandidate(candidate);
                
                await Candidate.findByIdAndUpdate(candidate._id, {
                    interviewScore: evaluation.interviewScore,
                    growthPotential: evaluation.growthPotential,
                    retentionScore: evaluation.retentionScore,
                    status: 'completed'
                });

                results.push({
                    candidateId: candidate._id,
                    name: candidate.name,
                    evaluation
                });
            } catch (error) {
                console.error(`Error evaluating candidate ${candidate._id}:`, error);
            }
        }

        res.json({
            success: true,
            data: {
                evaluated: results.length,
                results
            }
        });

    } catch (error) {
        console.error('Batch evaluation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to batch evaluate candidates'
        });
    }
});

// GET /api/evaluation/letter/:candidateId/:type - Download letter
router.get('/letter/:candidateId/:type', async (req, res) => {
    try {
        const { candidateId, type } = req.params;
        const candidate = await Candidate.findById(candidateId);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                error: 'Candidate not found'
            });
        }

        let letterResult;
        if (type === 'offer') {
            letterResult = await letterService.generateOfferLetter(candidate);
        } else if (type === 'rejection') {
            letterResult = await letterService.generateRejectionLetter(candidate);
        } else {
            return res.status(400).json({
                success: false,
                error: 'Invalid letter type. Use "offer" or "rejection"'
            });
        }

        // Set proper headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${letterResult.fileName}"`);
        
        // Send the file
        res.download(letterResult.filePath, letterResult.fileName, (err) => {
            if (err) {
                console.error('Download error:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        error: 'Failed to download letter'
                    });
                }
            }
        });

    } catch (error) {
        console.error('Letter download error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'Failed to generate letter: ' + error.message
            });
        }
    }
});

module.exports = router;