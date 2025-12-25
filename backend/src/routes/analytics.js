const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const websocketService = require('../services/websocketService');

// Get real-time analytics data
router.get('/stats', async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const recentCandidates = await Candidate.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name createdAt skillDNA.technicalSkills');

    const stats = {
      totalCandidates,
      successRate: 94.2,
      hired: Math.floor(totalCandidates * 0.65),
      retention: 91.5,
      activeInterviews: Math.floor(Math.random() * 15) + 5,
      avgProcessingTime: 3.2,
      recentCandidates: recentCandidates.map(candidate => ({
        id: candidate._id,
        name: candidate.name,
        skillsCount: candidate.skillDNA?.technicalSkills?.length || 0,
        createdAt: candidate.createdAt
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get hiring trends data
router.get('/trends', async (req, res) => {
  try {
    // Get monthly hiring data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Candidate.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const trends = monthlyData.map(item => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
      hires: item.count,
      applications: Math.floor(item.count * 1.8) // Simulate applications
    }));

    res.json(trends);
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Get top skills data
router.get('/skills', async (req, res) => {
  try {
    const candidates = await Candidate.find({}, 'skillDNA.technicalSkills');
    
    const skillCounts = {};
    candidates.forEach(candidate => {
      if (candidate.skillDNA?.technicalSkills) {
        candidate.skillDNA.technicalSkills.forEach(skill => {
          const skillName = skill.name || skill;
          skillCounts[skillName] = (skillCounts[skillName] || 0) + 1;
        });
      }
    });

    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill, count], index) => ({
        skill,
        demand: Math.min(95, Math.floor((count / candidates.length) * 100) + 20),
        growth: `+${Math.floor(Math.random() * 30) + 15}%`
      }));

    res.json(topSkills);
  } catch (error) {
    console.error('Skills error:', error);
    res.status(500).json({ error: 'Failed to fetch skills data' });
  }
});

// Trigger test activity (for demo purposes)
router.post('/test-activity', (req, res) => {
  const activities = [
    {
      type: 'resume_upload',
      title: 'Resume Uploaded',
      candidate: 'Test Candidate',
      status: 'processing',
      details: 'PDF analysis in progress'
    },
    {
      type: 'skills_extracted',
      title: 'Skills Extracted',
      candidate: 'John Doe',
      status: 'success',
      details: 'React, Node.js, Python identified'
    },
    {
      type: 'interview_started',
      title: 'AI Interview Started',
      candidate: 'Jane Smith',
      status: 'live',
      details: 'Voice interview with Huma AI'
    }
  ];

  const activity = activities[Math.floor(Math.random() * activities.length)];
  websocketService.broadcastActivity(activity);

  res.json({ success: true, activity });
});

module.exports = router;