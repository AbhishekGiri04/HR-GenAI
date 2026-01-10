const express = require('express');
const router = express.Router();
const AutoEvaluationService = require('../services/autoEvaluationService');

const autoEvalService = new AutoEvaluationService();

// POST /api/auto-eval/trigger/:candidateId - Trigger auto evaluation
router.post('/trigger/:candidateId', async (req, res) => {
    try {
        const { candidateId } = req.params;
        const result = await autoEvalService.autoEvaluateCandidate(candidateId);
        
        res.json({
            success: true,
            data: result,
            message: 'Auto-evaluation completed'
        });
    } catch (error) {
        console.error('Auto-eval trigger error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to trigger auto-evaluation'
        });
    }
});

// POST /api/auto-eval/batch - Process all pending candidates
router.post('/batch', async (req, res) => {
    try {
        await autoEvalService.processPendingCandidates();
        
        res.json({
            success: true,
            message: 'Batch processing completed'
        });
    } catch (error) {
        console.error('Batch processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process batch'
        });
    }
});

module.exports = router;