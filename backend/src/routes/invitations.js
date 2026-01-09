const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const Candidate = require('../models/Candidate');
const Template = require('../models/Template');
require('dotenv').config();

// Initialize Resend
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend email service initialized');
} else {
  console.log('❌ RESEND_API_KEY not set');
}

// Bulk invite candidates
router.post('/bulk-invite', async (req, res) => {
  try {
    console.log('=== BULK INVITE REQUEST ===');
    const { candidates, templateId, customMessage, interviewDate, interviewTime } = req.body;

    if (!candidates || candidates.length === 0) {
      return res.status(400).json({ error: 'No candidates provided' });
    }

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID required' });
    }
    
    if (!resend) {
      return res.status(500).json({ error: 'Email service not configured. Please set RESEND_API_KEY' });
    }

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    console.log('✅ Template found:', template.name);

    // Send immediate response
    res.json({
      success: true,
      message: 'Invitations are being sent',
      totalCandidates: candidates.length
    });

    // Process emails asynchronously
    (async () => {
      const results = [];

      for (const candidateData of candidates) {
        try {
          let candidate = await Candidate.findOne({ email: candidateData.email });
          
          if (!candidate) {
            candidate = new Candidate({
              name: candidateData.name,
              email: candidateData.email,
              appliedFor: template.name,
              assignedTemplate: templateId,
              invitedAt: new Date()
            });
            await candidate.save();
          } else {
            candidate.appliedFor = template.name;
            candidate.assignedTemplate = templateId;
            candidate.invitedAt = new Date();
            await candidate.save();
          }

          const interviewLink = `https://hrgen-dev.vercel.app/template-selection/${candidate._id}`;

          console.log(`Sending email to ${candidateData.email}...`);
          
          const emailResult = await resend.emails.send({
            from: 'HR GenAI <onboarding@resend.dev>',
            to: candidateData.email,
            subject: `Interview Invitation - ${template.name}`,
            html: generateInvitationEmail(candidateData.name, template, interviewLink, customMessage, interviewDate, interviewTime)
          });
          
          console.log(`✅ Email sent to ${candidateData.email}, ID: ${emailResult.id}`);
          
          results.push({ email: candidateData.email, status: 'sent' });
        } catch (error) {
          console.error(`❌ Failed ${candidateData.email}:`, error.message);
          results.push({ email: candidateData.email, status: 'failed', error: error.message });
        }
      }

      console.log(`=== COMPLETE: ${results.filter(r => r.status === 'sent').length}/${results.length} sent ===`);
    })().catch(err => console.error('Background error:', err));
    
  } catch (error) {
    console.error('❌ Bulk invite error:', error);
    res.status(500).json({ error: 'Failed to send invitations: ' + error.message });
  }
});

function generateInvitationEmail(candidateName, template, interviewLink, customMessage, interviewDate, interviewTime) {
  let scheduleSection = '';
  
  if (interviewDate && interviewTime) {
    const date = new Date(interviewDate);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    scheduleSection = `<div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border: 2px solid #667eea; padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center;">
      <h3 style="color: #667eea; margin: 0 0 15px 0; font-size: 20px;">📅 Scheduled Interview</h3>
      <p style="font-size: 22px; font-weight: 700; color: #2c3e50; margin: 10px 0;">${formattedDate}</p>
      <p style="font-size: 18px; margin: 10px 0; color: #495057;"><strong>Time:</strong> ${interviewTime}</p>
      <p style="color: #667eea; font-weight: 600; margin: 15px 0 0 0; font-size: 15px;">⏰ Please join at the scheduled time</p>
    </div>`;
  }
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Interview Invitation</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 16px; font-weight: 500;">HR-GenAI Hiring Platform</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 35px;">
              <p style="font-size: 18px; color: #2c3e50; margin: 0 0 25px 0; font-weight: 600;">Dear ${candidateName},</p>
              
              <p style="font-size: 16px; color: #4a5568; line-height: 1.7; margin: 0 0 25px 0;">
                We are pleased to inform you that you have been selected to participate in an interview for the position of <strong style="color: #2c3e50;">${template.name}</strong>. This is an important step in our hiring process, and we look forward to learning more about your qualifications and experience.
              </p>
              
              ${customMessage ? `<div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 6px;">
                <p style="margin: 0 0 8px 0; color: #495057; font-weight: 600; font-size: 15px;">📝 Message from Hiring Team:</p>
                <p style="margin: 0; color: #495057; font-size: 15px; line-height: 1.6;">${customMessage}</p>
              </div>` : ''}
              
              ${scheduleSection}
              
              <!-- Interview Details -->
              <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
                <h3 style="color: #667eea; margin: 0 0 20px 0; font-size: 18px; font-weight: 700;">📋 Interview Details</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #4a5568; font-size: 15px; padding: 8px 0;"><strong style="color: #2c3e50;">Position:</strong></td>
                    <td style="color: #4a5568; font-size: 15px; text-align: right; padding: 8px 0;">${template.name}</td>
                  </tr>
                  <tr>
                    <td style="color: #4a5568; font-size: 15px; padding: 8px 0;"><strong style="color: #2c3e50;">Interview Type:</strong></td>
                    <td style="color: #4a5568; font-size: 15px; text-align: right; padding: 8px 0;">${template.interviewType.charAt(0).toUpperCase() + template.interviewType.slice(1)}</td>
                  </tr>
                  <tr>
                    <td style="color: #4a5568; font-size: 15px; padding: 8px 0;"><strong style="color: #2c3e50;">Duration:</strong></td>
                    <td style="color: #4a5568; font-size: 15px; text-align: right; padding: 8px 0;">${template.duration} minutes</td>
                  </tr>
                  <tr>
                    <td style="color: #4a5568; font-size: 15px; padding: 8px 0;"><strong style="color: #2c3e50;">Difficulty Level:</strong></td>
                    <td style="color: #4a5568; font-size: 15px; text-align: right; padding: 8px 0;">${template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}</td>
                  </tr>
                  <tr>
                    <td style="color: #4a5568; font-size: 15px; padding: 8px 0;"><strong style="color: #2c3e50;">Passing Score:</strong></td>
                    <td style="color: #4a5568; font-size: 15px; text-align: right; padding: 8px 0;">${template.passingScore}%</td>
                  </tr>
                </table>
              </div>
              
              <!-- What to Expect -->
              <div style="margin: 25px 0;">
                <h3 style="color: #2c3e50; font-size: 18px; margin: 0 0 15px 0; font-weight: 700;">💡 What to Expect</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 15px; line-height: 1.8;">
                  <li style="margin-bottom: 10px;">AI-powered interview with voice and text-based questions</li>
                  <li style="margin-bottom: 10px;">Real-time proctoring for interview integrity</li>
                  <li style="margin-bottom: 10px;">Comprehensive evaluation of your skills and experience</li>
                  <li style="margin-bottom: 10px;">Instant feedback upon completion</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${interviewLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">🚀 Start Interview</a>
              </div>
              
              <!-- Important Notes -->
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 6px;">
                <h4 style="color: #856404; margin: 0 0 12px 0; font-size: 16px; font-weight: 700;">⚠️ Important Requirements</h4>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.7;">
                  <li style="margin-bottom: 8px;">Stable internet connection (minimum 5 Mbps)</li>
                  <li style="margin-bottom: 8px;">Working camera and microphone</li>
                  <li style="margin-bottom: 8px;">Use Google Chrome for best experience</li>
                  <li style="margin-bottom: 8px;">Quiet, well-lit environment</li>
                  <li style="margin-bottom: 8px;">Keep camera enabled throughout the interview</li>
                </ul>
              </div>
              
              <p style="font-size: 15px; color: #4a5568; line-height: 1.7; margin: 25px 0 0 0;">
                We wish you the best of luck with your interview. If you have any questions or encounter technical difficulties, please don't hesitate to reach out to our support team.
              </p>
              
              <!-- Signature -->
              <div style="margin-top: 35px; padding-top: 25px; border-top: 2px solid #e2e8f0;">
                <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 15px;">Best regards,</p>
                <p style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 700;">Talent Acquisition Team</p>
                <p style="margin: 5px 0 0 0; color: #667eea; font-size: 15px; font-weight: 600;">HR-GenAI Platform</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #2c3e50; color: #adb5bd; padding: 30px; text-align: center; font-size: 13px; line-height: 1.6;">
              <p style="margin: 0 0 10px 0;">&copy; 2026 HR-GenAI. All rights reserved.</p>
              <p style="margin: 0; color: #8b95a5;">This is an automated interview invitation. Please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = router;
