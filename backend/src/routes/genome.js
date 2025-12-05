const express = require('express');
const router = express.Router();
const genomeController = require('../controllers/genomeController');

router.post('/build', genomeController.buildGenome);
router.get('/:candidateId', genomeController.getGenome);
router.post('/match-role', genomeController.matchRole);

module.exports = router;