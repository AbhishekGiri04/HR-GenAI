const express = require('express');
const router = express.Router();
const multer = require('multer');
const candidateController = require('../controllers/candidateController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('resume'), candidateController.uploadResume);
router.get('/:id/questions', candidateController.getQuestions);
router.get('/:id', candidateController.getCandidate);
router.get('/', candidateController.getAllCandidates);
router.put('/:id', candidateController.updateCandidate);
router.delete('/:id', candidateController.deleteCandidate);

module.exports = router;