const express = require('express');
const router = express.Router();
const HumaAIService = require('../services/humaAIService');

const humaAI = new HumaAIService();

// POST /api/huma/chat - Main chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        const response = await humaAI.processQuery(message, userId);
        
        res.json(response);
    } catch (error) {
        console.error('Huma chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/huma/employee/:id - Get employee information
router.get('/employee/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const employee = humaAI.getEmployeeInfo(id);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error('Employee info error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/huma/leave/:id/:type - Get leave balance
router.get('/leave/:id/:type', async (req, res) => {
    try {
        const { id, type } = req.params;
        const leaveBalance = humaAI.calculateLeaveBalance(id, type);
        
        if (!leaveBalance) {
            return res.status(404).json({
                success: false,
                error: 'Employee or leave type not found'
            });
        }

        res.json({
            success: true,
            data: leaveBalance
        });
    } catch (error) {
        console.error('Leave balance error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;