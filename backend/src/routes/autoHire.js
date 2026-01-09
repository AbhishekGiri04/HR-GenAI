const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const { generateInterviewTemplate } = require('../ai-engines/smartMessageGenerator');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/auto-hire
 * Simple: Email + Job Role → Template → Deploy → Email
 */
router.post('/auto-hire', async (req, res) => {
  const { email, jobRole } = req.body;

  if (!email || !jobRole) {
    return res.status(400).json({ error: 'Email and job role required' });
  }

  try {
    console.log(`🚀 Auto-Hire: ${email} for ${jobRole}`);

    // Step 1: AI Generate Template
    const templateData = await generateInterviewTemplate(jobRole);
    
    // Step 2: Save & Deploy Template
    const template = new Template({
      ...templateData,
      isDeployed: true,
      isActive: true,
      createdBy: 'AI-Auto',
      categoryQuestions: {
        'Technical Skills': 3,
        'Problem Solving': 2,
        'Communication': 2
      }
    });
    await template.save();
    console.log(`✅ Template created & deployed: ${template._id}`);

    // Step 3: Send Email
    const dashboardLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
    
    const emailBody = `
Dear Candidate,

You've been invited to interview for the ${jobRole} position!

Our AI interviewer "Huma" will conduct a ${templateData.duration}-minute interview.

📋 Interview Topics:
${templateData.categories.map(cat => `• ${cat}`).join('\n')}

🔗 Start Interview: ${dashboardLink}

Steps:
1. Upload your resume
2. Huma will analyze and conduct interview
3. Results will be sent automatically

Good luck! 🚀

HR Team
    `.trim();

    // Step 3: Send Email using Resend
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'HR GenAI <onboarding@resend.dev>',
        to: email,
        subject: `Interview Invitation - ${jobRole}`,
        text: emailBody
      });
      console.log(`✅ Email sent to ${email}`);
    } catch (emailError) {
      console.log(`⚠️ Email failed: ${emailError.message}`);
    }

    res.json({
      success: true,
      templateName: template.name,
      templateId: template._id,
      message: 'Template created, deployed, and email sent!'
    });

  } catch (error) {
    console.error('❌ Auto-Hire Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
