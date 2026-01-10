const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const { generateInterviewTemplate } = require('../ai-engines/smartMessageGenerator');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/auto-hire
 * Quick AI Hire: Email + Job Role → AI creates template → Deploys → Sends email → Huma interviews
 */
router.post('/auto-hire', async (req, res) => {
  const { email, jobRole } = req.body;

  if (!email || !jobRole) {
    return res.status(400).json({ error: 'Email and job role required' });
  }

  try {
    console.log(`🚀 Quick AI Hire: ${email} for ${jobRole}`);

    // Step 1: AI Generate Template
    const templateData = await generateInterviewTemplate(jobRole);
    console.log(`📊 Template generated with ${templateData.questions.length} questions`);
    
    // Step 2: Save & Deploy Template (Check for duplicates)
    const existingTemplate = await Template.findOne({ 
      name: templateData.name,
      createdBy: 'AI-Auto',
      createdAt: { $gte: new Date(Date.now() - 60000) } // Last 1 minute
    });
    
    if (existingTemplate) {
      console.log(`⚠️ Template already exists: ${existingTemplate._id}`);
      return res.json({
        success: true,
        templateName: existingTemplate.name,
        templateId: existingTemplate._id,
        message: 'Template already created!'
      });
    }
    
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

    // Step 3: Send Email using Resend with HTML
    const dashboardLink = process.env.FRONTEND_URL || 'https://hrgen-dev.vercel.app';
    
    const inviteHTML = `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}.content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px}.section{margin:20px 0}.section h3{color:#667eea;margin-bottom:10px}.info-box{background:white;padding:15px;border-radius:8px;margin:10px 0;border-left:4px solid #667eea}.button{display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:bold;margin:20px 0}.checklist{background:white;padding:15px;border-radius:8px}.checklist li{margin:8px 0}.footer{text-align:center;margin-top:30px;color:#666;font-size:12px}</style></head><body><div class="container"><div class="header"><h1>🧠 HR-GenAI</h1><p>AI-Powered Hiring Intelligence</p></div><div class="content"><h2>Interview Invitation - ${jobRole}</h2><p>Dear Candidate,</p><p>You've been invited to interview for the <strong>${jobRole}</strong> position!</p><div class="section"><h3>🤖 AI Interview Details</h3><div class="info-box"><p>Our intelligent interviewer "Huma" will conduct a personalized ${templateData.duration}-minute interview.</p></div></div><div class="section"><h3>📋 Interview Topics</h3><div class="info-box"><ul>${templateData.categories.map(cat => `<li>${cat}</li>`).join('')}</ul></div></div><div class="section"><h3>📅 Interview Information</h3><div class="info-box"><ul><li><strong>Duration:</strong> ${templateData.duration} minutes</li><li><strong>Difficulty:</strong> ${templateData.difficulty.charAt(0).toUpperCase() + templateData.difficulty.slice(1)}</li><li><strong>Passing Score:</strong> ${templateData.passingScore}%</li><li><strong>Total Questions:</strong> ${templateData.totalQuestions || 8}</li></ul></div></div><div style="text-align:center"><a href="${dashboardLink}" class="button">🎯 Start Interview</a></div><div class="section"><h3>📝 Steps to Complete</h3><div class="checklist"><ol><li>Click the button above</li><li>Upload your resume</li><li>Huma will analyze your profile</li><li>Complete the AI-powered interview</li><li>Results will be sent automatically</li></ol></div></div><div class="section"><h3>✅ Please Ensure</h3><div class="checklist"><ul><li>Stable internet connection</li><li>Working microphone and camera</li><li>Quiet environment</li></ul></div></div><p style="margin-top:30px">Good luck! 🚀</p><p>Best regards,<br><strong>HR Team - Powered by Huma AI</strong></p></div><div class="footer"><p>© 2025 HR-GenAI. All Rights Reserved.</p></div></div></body></html>`;

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'HR GenAI <onboarding@resend.dev>',
        to: email,
        subject: `🎯 Interview Invitation - ${jobRole} Position`,
        html: inviteHTML
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
