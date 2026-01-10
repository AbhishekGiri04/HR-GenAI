const express = require('express');
const router = express.Router();
const AutoInterviewScheduler = require('../services/autoInterviewScheduler');
const emailService = require('../services/emailService');

const scheduler = new AutoInterviewScheduler();

// POST /api/schedule/auto-interview - Auto schedule interview
router.post('/auto-interview', async (req, res) => {
    try {
        const { candidateId, candidateName, candidateEmail, templateId, hrEmail, jobRole, startDate, endDate } = req.body;

        if (!candidateId || !candidateName || !candidateEmail) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Get next available slot within date range
        let slot;
        if (startDate && endDate) {
            // Find slot within specified date range
            slot = scheduler.getNextAvailableSlotInRange(startDate, endDate);
        } else {
            // Use default next available slot
            slot = scheduler.getNextAvailableSlot();
        }
        
        // Book the slot
        scheduler.bookSlot(slot.date);

        // Generate interview link
        const interviewLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/candidate-interview/${templateId}/${candidateId}`;

        // Send automated email
        const emailSent = await emailService.sendInterviewInvitation({
            candidateName,
            candidateEmail,
            interviewDate: slot.date,
            interviewTime: slot.time,
            interviewLink,
            hrEmail: hrEmail || 'hr@company.com',
            jobRole: jobRole || 'Software Developer'
        });

        res.json({
            success: true,
            data: {
                candidateId,
                scheduledSlot: slot,
                interviewLink,
                emailSent,
                jobRole
            },
            message: `Interview automatically scheduled for ${slot.date} at ${slot.time}`
        });

    } catch (error) {
        console.error('Auto scheduling error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to schedule interview'
        });
    }
});

// GET /api/schedule/availability - Get schedule availability
router.get('/availability', (req, res) => {
    try {
        const { days = 7 } = req.query;
        const summary = scheduler.getScheduleSummary(parseInt(days));
        
        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Availability error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get availability'
        });
    }
});

// POST /api/schedule/set-capacity - Set daily interview capacity
router.post('/set-capacity', (req, res) => {
    try {
        const { capacity } = req.body;
        
        if (!capacity || capacity < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid capacity value'
            });
        }

        scheduler.setDailyCapacity(capacity);
        
        res.json({
            success: true,
            message: `Daily capacity set to ${capacity} interviews`
        });
    } catch (error) {
        console.error('Set capacity error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to set capacity'
        });
    }
});

// GET /api/schedule/next-slot - Get next available slot
router.get('/next-slot', (req, res) => {
    try {
        const slot = scheduler.getNextAvailableSlot();
        
        res.json({
            success: true,
            data: slot
        });
    } catch (error) {
        console.error('Next slot error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get next slot'
        });
    }
});

module.exports = router;