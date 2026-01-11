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
  let { email, jobRole } = req.body;

  if (!email || !jobRole) {
    return res.status(400).json({ error: 'Email and job role required' });
  }

  // Support multiple emails (comma-separated or array)
  const emails = Array.isArray(email) ? email : email.split(',').map(e => e.trim());

  try {
    console.log(`🚀 Quick AI Hire: ${emails.length} candidates for ${jobRole}`);

    // Step 1: AI Generate Template (once for all)
    const templateData = await generateInterviewTemplate(jobRole);
    console.log(`📊 Template generated with ${templateData.questions.length} questions`);
    
    // Step 2: Check for existing template
    let template = await Template.findOne({ 
      name: templateData.name,
      createdBy: 'AI-Auto',
      createdAt: { $gte: new Date(Date.now() - 60000) }
    });
    
    if (!template) {
      template = new Template({
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
    } else {
      console.log(`✅ Using existing template: ${template._id}`);
    }

    // Step 3: Send emails to all candidates
    const dashboardLink = process.env.FRONTEND_URL || 'https://hrgen-dev.vercel.app';
    const inviteHTML = `<!DOCTYPE html><html><head><style>body{font-family:'Segoe UI',sans-serif;background:#f5f7fa;padding:20px}.container{max-width:650px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:40px 30px;text-align:center}.header h1{font-size:28px;margin-bottom:8px;font-weight:700}.header p{font-size:16px;opacity:0.9}.content{padding:40px 30px}.greeting{font-size:20px;color:#1a202c;margin-bottom:20px;font-weight:600}.intro{color:#4a5568;line-height:1.8;margin-bottom:30px}.info-box{background:linear-gradient(135deg,#f7fafc 0%,#edf2f7 100%);border-left:4px solid #667eea;padding:25px;border-radius:8px;margin:25px 0}.info-box h3{color:#2d3748;font-size:18px;margin-bottom:15px;font-weight:600}.info-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e2e8f0}.info-row:last-child{border-bottom:none}.info-label{color:#718096;font-weight:500}.info-value{color:#2d3748;font-weight:600}.button{display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:600;margin:30px 0;font-size:16px;box-shadow:0 4px 15px rgba(102,126,234,0.4)}.instructions{background:#fffbeb;border-left:4px solid #f59e0b;padding:20px;border-radius:8px;margin:25px 0}.instructions h3{color:#92400e;margin-bottom:15px;font-size:16px;font-weight:600}.instructions ul{list-style:none}.instructions li{color:#78350f;margin:8px 0;padding-left:20px;position:relative}.instructions li:before{content:'✓';position:absolute;left:0;color:#f59e0b;font-weight:bold}.footer{background:#f7fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0}.footer p{color:#718096;font-size:13px;margin:5px 0}</style></head><body><div class="container"><div class="header"><h1>HR-GenAI</h1><p>AI-Powered Hiring Intelligence Platform</p></div><div class="content"><div class="greeting">Dear Candidate,</div><p class="intro">We are pleased to invite you to participate in our AI-powered interview process for the <strong>${jobRole}</strong> position.</p><div class="info-box"><h3>Interview Details</h3><div class="info-row"><span class="info-label">Position</span><span class="info-value">${jobRole}</span></div><div class="info-row"><span class="info-label">Duration</span><span class="info-value">${templateData.duration} minutes</span></div><div class="info-row"><span class="info-label">Difficulty</span><span class="info-value">${templateData.difficulty.charAt(0).toUpperCase() + templateData.difficulty.slice(1)}</span></div><div class="info-row"><span class="info-label">Passing Score</span><span class="info-value">${templateData.passingScore}%</span></div></div><div style="text-align:center"><a href="${dashboardLink}" class="button">Start Interview</a></div><div class="instructions"><h3>Before You Begin</h3><ul><li>Ensure stable internet connection</li><li>Use Chrome or Firefox browser</li><li>Enable camera and microphone</li><li>Find a quiet environment</li></ul></div><p style="color:#2d3748;margin-top:30px">Best regards,<br><strong>HR Team</strong><br>HR-GenAI Platform</p></div><div class="footer"><p><strong>HR-GenAI</strong> - AI-Powered Hiring Intelligence Platform</p><p>© 2026 HR-GenAI. All rights reserved.</p></div></div></body></html>`;

    let successCount = 0;
    let failCount = 0;

    for (const candidateEmail of emails) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'HR GenAI <onboarding@resend.dev>',
          to: candidateEmail,
          subject: `Interview Invitation - ${jobRole} Position`,
          html: inviteHTML
        });
        console.log(`✅ Email sent to ${candidateEmail}`);
        successCount++;
      } catch (emailError) {
        console.log(`⚠️ Email failed for ${candidateEmail}: ${emailError.message}`);
        failCount++;
      }
    }

    res.json({
      success: true,
      templateName: template.name,
      templateId: template._id,
      emailsSent: successCount,
      emailsFailed: failCount,
      totalEmails: emails.length,
      message: `Template deployed! Emails sent to ${successCount}/${emails.length} candidates`
    });

  } catch (error) {
    console.error('❌ Auto-Hire Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
