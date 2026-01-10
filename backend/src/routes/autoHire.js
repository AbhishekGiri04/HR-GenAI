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
    console.log(`📊 Template generated with ${templateData.questions.length} questions`);
    
    // Step 2: Save & Deploy Template
    const template = new Template({
      ...templateData,
      isDeployed: true,
      isActive: true,
      createdBy: 'AI-Auto',
      categoryQuestions: {
        'Technical Skills': 5,
        'Behavioral': 3
      }
    });
    await template.save();
    console.log(`✅ Template created & deployed: ${template._id}`);
    console.log(`✅ Questions saved: ${template.questions.length}`);

    // Step 3: Send Email using Resend
    const dashboardLink = process.env.FRONTEND_URL || 'https://hrgen-dev.vercel.app';
    
    const inviteMessage = `
Dear Candidate,

You've been invited to interview for the ${jobRole} position!

🤖 AI Interview Details:
Our intelligent interviewer "Huma" will conduct a personalized ${templateData.duration}-minute interview.

📋 Interview Topics:
${templateData.categories.map(cat => `• ${cat}`).join('\n')}

📅 Interview Information:
• Duration: ${templateData.duration} minutes
• Difficulty: ${templateData.difficulty.charAt(0).toUpperCase() + templateData.difficulty.slice(1)}
• Passing Score: ${templateData.passingScore}%
• Total Questions: ${templateData.totalQuestions} (5 Voice + 3 Text)

🎯 Interview Link: ${dashboardLink}

📝 Steps to Complete:
1. Click the link above
2. Upload your resume
3. Huma will analyze your profile
4. Complete the AI-powered interview (Voice + Text)
5. Results will be sent automatically

Please ensure:
✓ Stable internet connection
✓ Working microphone and camera (for voice questions)
✓ Quiet environment

Good luck! 🚀

Best regards,
HR Team - Powered by Huma AI
    `.trim();

    // Step 3: Send Email using Resend
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'HR GenAI <onboarding@resend.dev>',
        to: email,
        subject: `🎯 Interview Invitation - ${jobRole} Position`,
        text: inviteMessage
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
