const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Candidate = require('../models/Candidate');
const Template = require('../models/Template');
require('dotenv').config();

// Email transporter with proper error handling
let transporter = null;
try {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not set in environment variables');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set (hidden)' : 'Not set');
  } else {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      timeout: 10000,
      connectionTimeout: 10000
    });
    console.log('✅ Email transporter initialized for:', process.env.EMAIL_USER);
    
    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email verification failed:', error.message);
      } else {
        console.log('✅ Email server connection verified');
      }
    });
  }
} catch (error) {
  console.error('❌ Email transporter failed:', error.message);
}

// Bulk invite candidates - All templates allowed
router.post('/bulk-invite', async (req, res) => {
  try {
    console.log('=== BULK INVITE REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { candidates, templateId, customMessage, interviewDate, interviewTime } = req.body;

    if (!candidates || candidates.length === 0) {
      console.log('❌ No candidates provided');
      return res.status(400).json({ error: 'No candidates provided' });
    }

    if (!templateId) {
      console.log('❌ No template ID provided');
      return res.status(400).json({ error: 'Template ID required' });
    }
    
    if (!transporter) {
      console.log('❌ Email transporter not configured');
      console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
      console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
      return res.status(500).json({ error: 'Email service not configured. Please check EMAIL_USER and EMAIL_PASS in .env file' });
    }

    // Get template details
    console.log('Fetching template:', templateId);
    const template = await Template.findById(templateId);
    if (!template) {
      console.log('❌ Template not found:', templateId);
      return res.status(404).json({ error: 'Template not found' });
    }

    console.log('✅ Template found and validated:', template.name);

    // Send immediate response and process emails in background
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
        console.log(`Processing candidate: ${candidateData.email}`);
        
        // Create or update candidate
        let candidate = await Candidate.findOne({ email: candidateData.email });
        
        if (!candidate) {
          candidate = new Candidate({
            name: candidateData.name,
            email: candidateData.email,
            appliedFor: template.name,
            assignedTemplate: templateId,
            interviewStatus: 'invited',
            invitedAt: new Date()
          });
          await candidate.save();
          console.log('✅ New candidate created:', candidate._id);
        } else {
          candidate.appliedFor = template.name;
          candidate.assignedTemplate = templateId;
          candidate.interviewStatus = 'invited';
          candidate.invitedAt = new Date();
          await candidate.save();
          console.log('✅ Existing candidate updated:', candidate._id);
        }

        // Generate interview link
        const interviewLink = `https://hrgen-dev.vercel.app/template-selection/${candidate._id}`;
        console.log('Interview link:', interviewLink);

        // Send invitation email
        const mailOptions = {
          from: `"HR GenAI" <${process.env.EMAIL_USER}>`,
          to: candidateData.email,
          subject: `Interview Invitation - ${template.name}`,
          html: generateInvitationEmail(candidateData.name, template, interviewLink, customMessage, interviewDate, interviewTime)
        };

        console.log(`Sending interview email to ${candidateData.email}...`);
        const emailResult = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${candidateData.email}`);
        console.log(`   Message ID: ${emailResult.messageId}`);
        console.log(`   Response: ${emailResult.response}`);
        
        results.push({
          email: candidateData.email,
          status: 'sent',
          candidateId: candidate._id,
          messageId: emailResult.messageId
        });

        console.log(`✅ Invitation sent to ${candidateData.email}`);
      } catch (error) {
        console.error(`❌ Failed to invite ${candidateData.email}:`, error.message);
        console.error('Error code:', error.code);
        console.error('Error response:', error.response);
        results.push({
          email: candidateData.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    console.log(`=== BULK INVITE COMPLETE: ${successCount}/${results.length} invitations sent ===`);
    })().catch(err => console.error('Background email processing error:', err));
    
  } catch (error) {
    console.error('❌ Bulk invite error:', error);
    res.status(500).json({ error: 'Failed to send invitations: ' + error.message });
  }
});

// Generate invitation email HTML
function generateInvitationEmail(candidateName, template, interviewLink, customMessage, interviewDate, interviewTime) {
  let scheduleSection = '';
  
  if (interviewDate && interviewTime) {
    const date = new Date(interviewDate);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    scheduleSection = `
      <div class="schedule-box">
        <h3>📅 Scheduled Interview</h3>
        <p class="date">${formattedDate}</p>
        <p><strong>Time:</strong> ${interviewTime}</p>
        <p style="color: #667eea; font-weight: 600; margin-top: 10px;">Please complete the interview on the scheduled date and time</p>
      </div>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #2c3e50; background-color: #f4f6f9; margin: 0; padding: 0; }
        .email-wrapper { background-color: #f4f6f9; padding: 40px 20px; }
        .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0 0 10px 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 0; font-size: 15px; opacity: 0.95; }
        .content { padding: 40px 35px; background: white; }
        .greeting { font-size: 18px; color: #2c3e50; margin-bottom: 20px; font-weight: 500; }
        .intro-text { font-size: 15px; color: #555; margin-bottom: 25px; line-height: 1.7; }
        .custom-message { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 6px; }
        .custom-message p { margin: 0; color: #495057; font-size: 15px; font-style: italic; }
        .info-section { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; }
        .info-section h3 { color: #667eea; margin: 0 0 15px 0; font-size: 17px; font-weight: 600; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .info-item { display: flex; padding: 8px 0; }
        .info-label { font-weight: 600; color: #495057; min-width: 120px; }
        .info-value { color: #6c757d; }
        .schedule-box { background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border: 2px solid #667eea; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; }
        .schedule-box h3 { color: #667eea; margin: 0 0 15px 0; font-size: 18px; }
        .schedule-box p { margin: 8px 0; color: #495057; font-size: 15px; }
        .schedule-box .date { font-size: 20px; font-weight: 600; color: #2c3e50; margin: 10px 0; }
        .button-container { text-align: center; margin: 35px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .expectations { margin: 25px 0; }
        .expectations h3 { color: #2c3e50; font-size: 17px; margin-bottom: 15px; font-weight: 600; }
        .expectations ul { list-style: none; padding: 0; margin: 0; }
        .expectations li { padding: 10px 0; color: #555; font-size: 15px; border-bottom: 1px solid #e9ecef; }
        .expectations li:last-child { border-bottom: none; }
        .instructions { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 6px; }
        .instructions h3 { color: #856404; margin: 0 0 15px 0; font-size: 16px; font-weight: 600; }
        .instructions ol { margin: 10px 0; padding-left: 20px; color: #856404; }
        .instructions li { margin: 8px 0; font-size: 14px; }
        .important { background: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 25px 0; border-radius: 6px; }
        .important h3 { color: #721c24; margin: 0 0 15px 0; font-size: 16px; font-weight: 600; }
        .important ul { margin: 10px 0; padding-left: 20px; color: #721c24; }
        .important li { margin: 8px 0; font-size: 14px; }
        .footer-text { margin-top: 30px; padding-top: 25px; border-top: 2px solid #e9ecef; color: #6c757d; font-size: 15px; }
        .signature { margin-top: 25px; }
        .signature p { margin: 5px 0; color: #495057; }
        .signature strong { color: #2c3e50; }
        .footer { background: #2c3e50; color: #adb5bd; padding: 25px; text-align: center; font-size: 13px; }
        .footer p { margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <h1>📅 Scheduled Interview Invitation</h1>
            <p>HR-GenAI Hiring Intelligence Platform</p>
          </div>
          
          <div class="content">
            <p class="greeting">Dear ${candidateName},</p>
            
            <p class="intro-text">
              We are pleased to inform you that your application for the position of <strong>${template.name}</strong> has been shortlisted. 
              We would like to invite you to participate in our <strong>scheduled AI-powered interview assessment</strong>.
            </p>
            
            ${customMessage ? `
            <div class="custom-message">
              <p><strong>Message from Hiring Team:</strong></p>
              <p>${customMessage}</p>
            </div>
            ` : ''}
            
            ${scheduleSection}
            
            <div class="info-section">
              <h3>Position Details</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Position:</span>
                  <span class="info-value">${template.name}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Interview Type:</span>
                  <span class="info-value">${template.interviewType.charAt(0).toUpperCase() + template.interviewType.slice(1)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Duration:</span>
                  <span class="info-value">${template.duration} minutes</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Difficulty Level:</span>
                  <span class="info-value">${template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Passing Score:</span>
                  <span class="info-value">${template.passingScore}%</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Total Questions:</span>
                  <span class="info-value">${template.totalQuestions || 'Multiple'}</span>
                </div>
              </div>
            </div>
            
            <div class="expectations">
              <h3>What to Expect</h3>
              <ul>
                <li>🤖 AI-powered voice interviewer (Huma) will conduct technical assessments</li>
                <li>📹 Real-time proctoring with camera monitoring for integrity</li>
                <li>⏱️ Timed questions with automatic submission</li>
                <li>📊 Category-wise evaluation of your skills and competencies</li>
                <li>⚡ Instant results and comprehensive feedback upon completion</li>
              </ul>
            </div>
            
            <div class="button-container">
              <a href="${interviewLink}" class="button">🚀 Access Scheduled Interview</a>
            </div>
            
            <div class="instructions">
              <h3>📝 Instructions Before You Begin</h3>
              <ol>
                <li>Click the "Access Scheduled Interview" button above during the scheduled time</li>
                <li>Sign in with your credentials or create a new account</li>
                <li>Review the interview template and requirements</li>
                <li>Complete the camera and microphone setup verification</li>
                <li>Ensure you are in a quiet, well-lit environment</li>
                <li>Answer all questions within the allocated time limit</li>
              </ol>
            </div>
            
            <div class="important">
              <h3>⚠️ Critical Requirements</h3>
              <ul>
                <li><strong>Time Window:</strong> Interview is ONLY available during scheduled hours</li>
                <li><strong>Internet:</strong> Stable connection (minimum 5 Mbps recommended)</li>
                <li><strong>Browser:</strong> Use Google Chrome for optimal experience</li>
                <li><strong>Equipment:</strong> Working camera and microphone required</li>
                <li><strong>Environment:</strong> Quiet, distraction-free space</li>
                <li><strong>Monitoring:</strong> Keep camera enabled throughout the interview</li>
                <li><strong>Focus:</strong> Do not switch tabs or leave the interview window</li>
                <li><strong>ID:</strong> Have valid government-issued ID ready for verification</li>
              </ul>
            </div>
            
            <p class="footer-text">
              <strong>Please note:</strong> This is a scheduled interview that will only be available during the specified time window. 
              If you encounter any technical difficulties during the scheduled time, please contact our support team immediately.
            </p>
            
            <div class="signature">
              <p>Best regards,</p>
              <p><strong>Talent Acquisition Team</strong></p>
              <p><strong>HR-GenAI Platform</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 HR-GenAI. All rights reserved.</p>
            <p>This is an automated email for a scheduled interview. Please do not reply directly to this message.</p>
            <p>For support during interview time, contact: ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;
