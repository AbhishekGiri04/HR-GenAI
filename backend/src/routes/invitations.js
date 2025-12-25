const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Candidate = require('../models/Candidate');
const Template = require('../models/Template');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Bulk invite candidates
router.post('/bulk-invite', async (req, res) => {
  try {
    const { candidates, templateId, customMessage } = req.body;

    if (!candidates || candidates.length === 0) {
      return res.status(400).json({ error: 'No candidates provided' });
    }

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID required' });
    }

    // Get template details
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const results = [];
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    for (const candidateData of candidates) {
      try {
        // Create or update candidate
        let candidate = await Candidate.findOne({ email: candidateData.email });
        
        if (!candidate) {
          candidate = new Candidate({
            personalInfo: {
              name: candidateData.name,
              email: candidateData.email
            },
            email: candidateData.email,
            assignedTemplate: templateId,
            interviewStatus: 'invited',
            invitedAt: new Date()
          });
          await candidate.save();
        } else {
          candidate.assignedTemplate = templateId;
          candidate.interviewStatus = 'invited';
          candidate.invitedAt = new Date();
          await candidate.save();
        }

        // Generate interview link
        const interviewLink = `${frontendUrl}/template-selection/${candidate._id}`;

        // Send invitation email
        const mailOptions = {
          from: `"HR GenAI" <${process.env.EMAIL_USER}>`,
          to: candidateData.email,
          subject: `Interview Invitation - ${template.name}`,
          html: generateInvitationEmail(candidateData.name, template, interviewLink, customMessage)
        };

        await transporter.sendMail(mailOptions);
        
        results.push({
          email: candidateData.email,
          status: 'sent',
          candidateId: candidate._id
        });

        console.log(`✅ Invitation sent to ${candidateData.email}`);
      } catch (error) {
        console.error(`❌ Failed to invite ${candidateData.email}:`, error);
        results.push({
          email: candidateData.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;

    res.json({
      success: true,
      sent: successCount,
      failed: results.length - successCount,
      results
    });
  } catch (error) {
    console.error('Bulk invite error:', error);
    res.status(500).json({ error: 'Failed to send invitations' });
  }
});

// Generate invitation email HTML
function generateInvitationEmail(candidateName, template, interviewLink, customMessage) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Interview Invitation</h1>
          <p>HR-GenAI Hiring Intelligence Platform</p>
        </div>
        
        <div class="content">
          <h2>Dear ${candidateName},</h2>
          
          <p>We are pleased to invite you to participate in our AI-powered interview process for the position of <strong>${template.name}</strong>.</p>
          
          ${customMessage ? `<div class="info-box"><p><strong>Message from HR:</strong><br/>${customMessage}</p></div>` : ''}
          
          <div class="info-box">
            <h3>📋 Interview Details:</h3>
            <ul>
              <li><strong>Position:</strong> ${template.name}</li>
              <li><strong>Duration:</strong> ${template.duration} minutes</li>
              <li><strong>Difficulty:</strong> ${template.difficulty.toUpperCase()}</li>
              <li><strong>Type:</strong> ${template.interviewType.toUpperCase()}</li>
              <li><strong>Passing Score:</strong> ${template.passingScore}%</li>
            </ul>
          </div>
          
          <div class="info-box">
            <h3>✨ What to Expect:</h3>
            <ul>
              <li>🤖 AI-powered voice interviewer (Huma)</li>
              <li>📹 Real-time proctoring with camera</li>
              <li>⏱️ Timed questions with auto-submission</li>
              <li>🎯 Category-wise assessment</li>
              <li>📊 Instant results and feedback</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${interviewLink}" class="button">Start Interview</a>
          </div>
          
          <div class="info-box">
            <h3>📝 Instructions:</h3>
            <ol>
              <li>Click the button above to access the interview platform</li>
              <li>Sign in or create an account</li>
              <li>Select the interview template</li>
              <li>Complete camera and microphone setup</li>
              <li>Answer all questions within the time limit</li>
            </ol>
          </div>
          
          <p><strong>⚠️ Important:</strong></p>
          <ul>
            <li>Ensure stable internet connection</li>
            <li>Use Chrome browser for best experience</li>
            <li>Find a quiet environment</li>
            <li>Keep your camera and microphone enabled</li>
            <li>Do not switch tabs during the interview</li>
          </ul>
          
          <p>If you have any questions, please reply to this email.</p>
          
          <p>Best regards,<br/>
          <strong>HR Team</strong><br/>
          HR-GenAI Platform</p>
        </div>
        
        <div class="footer">
          <p>© 2025 HR-GenAI. All rights reserved.</p>
          <p>This is an automated email. Please do not reply directly.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;
