const express = require('express');
const router = express.Router();

// Test endpoint for Huma AI
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Huma AI service is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;