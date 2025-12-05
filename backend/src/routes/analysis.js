const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

router.post('/resume', analysisController.analyzeResume);
router.post('/interview', analysisController.analyzeInterview);
router.get('/:candidateId', analysisController.getAnalysis);

module.exports = router;