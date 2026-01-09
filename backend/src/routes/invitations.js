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
    scheduleSection = `<div style="background: #f0f4ff; border: 2px solid #667eea; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <h3 style="color: #667eea; margin: 0 0 10px 0;">📅 Scheduled Interview</h3>
      <p style="font-size: 18px; font-weight: 600; margin: 10px 0;">${formattedDate}</p>
      <p style="margin: 5px 0;"><strong>Time:</strong> ${interviewTime}</p>
    </div>`;
  }
  
  return `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="margin: 0;">Interview Invitation</h1>
      <p style="margin: 10px 0 0 0;">HR-GenAI Platform</p>
    </div>
    <div style="padding: 30px; background: white;">
      <p>Dear ${candidateName},</p>
      <p>You have been invited to participate in an AI-powered interview for <strong>${template.name}</strong>.</p>
      ${customMessage ? `<div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;"><p style="margin: 0;"><strong>Message:</strong> ${customMessage}</p></div>` : ''}
      ${scheduleSection}
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #667eea; margin: 0 0 15px 0;">Interview Details</h3>
        <p style="margin: 5px 0;"><strong>Duration:</strong> ${template.duration} minutes</p>
        <p style="margin: 5px 0;"><strong>Difficulty:</strong> ${template.difficulty}</p>
        <p style="margin: 5px 0;"><strong>Passing Score:</strong> ${template.passingScore}%</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${interviewLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600;">Start Interview</a>
      </div>
      <p style="color: #666; font-size: 14px;">Best regards,<br><strong>HR-GenAI Team</strong></p>
    </div>
    <div style="background: #2c3e50; color: #adb5bd; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px;">
      <p style="margin: 5px 0;">&copy; 2025 HR-GenAI. All rights reserved.</p>
    </div>
  </body></html>`;
}

module.exports = router;
