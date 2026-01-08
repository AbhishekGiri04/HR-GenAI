const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

router.post('/resume', analysisController.analyzeResume);
router.post('/interview', analysisController.analyzeInterview);
router.post('/evaluate-interview', analysisController.evaluateInterview);
router.post('/followup', analysisController.generateFollowUp);
router.get('/:candidateId', analysisController.getAnalysis);

module.exports = router;