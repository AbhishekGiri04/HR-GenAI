const express = require('express');
const router = express.Router();
const multer = require('multer');
const candidateController = require('../controllers/candidateController');

const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

router.post('/upload', upload.single('resume'), candidateController.uploadResume);
router.delete('/reset', candidateController.resetAllCandidates);
router.get('/:id/resume', candidateController.getResume);
router.get('/:id/questions', candidateController.getQuestions);
router.get('/:id', candidateController.getCandidate);
router.get('/', candidateController.getAllCandidates);
router.put('/:id', candidateController.updateCandidate);
router.delete('/:id', candidateController.deleteCandidate);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  if (error.message === 'Only PDF and DOCX files are allowed') {
    return res.status(400).json({ error: 'Invalid file type. Only PDF and DOCX files are allowed.' });
  }
  next(error);
});

module.exports = router;