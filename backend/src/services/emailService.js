const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
      });
    } catch (error) {
      console.log('Email service not configured');
      this.transporter = null;
    }
  }

  async sendInterviewCompletionEmail(candidate, summary) {
    if (!this.transporter) {
      console.log('Email service not configured - skipping email');
      return false;
    }
    try {
      // Check if candidate passed and send offer letter
      const overallScore = candidate.skillDNA?.overallScore || 0;
      const passingScore = candidate.assignedTemplate?.passingScore || 70;
      const passed = overallScore >= passingScore;

      const mailOptions = {
        from: process.env.EMAIL_USER || 'HR-GenAI <noreply@hrgenai.com>',
        to: candidate.email,
        subject: passed ? `🎉 Congratulations! Interview Passed - ${candidate.name}` : `Interview Completed - ${candidate.name}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .verdict { padding: 15px; margin: 20px 0; border-radius: 8px; font-weight: bold; text-align: center; font-size: 18px; }
    .verdict.strong-hire { background: #10b981; color: white; }
    .verdict.hire { background: #3b82f6; color: white; }
    .verdict.maybe { background: #f59e0b; color: white; }
    .verdict.reject { background: #ef4444; color: white; }
    .section { margin: 20px 0; }
    .section h3 { color: #667eea; margin-bottom: 10px; }
    .list { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .list li { margin: 8px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧬 HR-GenAI</h1>
      <p>AI-Powered Hiring Intelligence</p>
    </div>
    
    <div class="content">
      <h2>Hello ${candidate.name}! 👋</h2>
      
      <p>Thank you for completing your AI interview with HR-GenAI. Here's your comprehensive evaluation:</p>
      
      <div class="verdict ${summary?.verdict?.toLowerCase().replace(' ', '-') || 'maybe'}">
        ${summary?.verdict || 'Under Review'}
      </div>
      
      <div class="section">
        <h3>📋 Interview Summary</h3>
        <p>${summary?.summary || 'Your interview has been completed and is under review.'}</p>
      </div>
      
      <div class="section">
        <h3>✅ Your Strengths</h3>
        <div class="list">
          <ul>
            ${summary?.strengths?.map(s => `<li>${s}</li>`).join('') || '<li>Analysis in progress</li>'}
          </ul>
        </div>
      </div>
      
      <div class="section">
        <h3>📈 Areas for Improvement</h3>
        <div class="list">
          <ul>
            ${summary?.weaknesses?.map(w => `<li>${w}</li>`).join('') || '<li>Analysis in progress</li>'}
          </ul>
        </div>
      </div>
      
      <div class="section">
        <h3>🎯 Recommended Role</h3>
        <p><strong>${summary?.recommendedRole || 'To be determined'}</strong></p>
      </div>
      
      <div class="section">
        <h3>📊 Your Scores</h3>
        <div class="list">
          <ul>
            <li><strong>Overall Score:</strong> ${candidate.skillDNA?.overallScore || 'N/A'}/100</li>
            <li><strong>EQ Score:</strong> ${candidate.eqAnalysis?.overallEQ || 'N/A'}/10</li>
            <li><strong>Personality Type:</strong> ${candidate.personality?.mbti || 'N/A'}</li>
          </ul>
        </div>
      </div>
      
      <div class="section">
        <h3>🔮 Next Steps</h3>
        <div class="list">
          <ul>
            ${summary?.nextSteps?.map(s => `<li>${s}</li>`).join('') || '<li>Our HR team will contact you soon</li>'}
          </ul>
        </div>
      </div>
      
      <p style="margin-top: 30px;">If you have any questions, please don't hesitate to reach out to our HR team.</p>
      
      <p>Best regards,<br><strong>HR-GenAI Team</strong></p>
    </div>
    
    <div class="footer">
      <p>© 2025 HR-GenAI. All Rights Reserved.</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
        `
      };

      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${candidate.email}`);
        

      }
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }


}

module.exports = new EmailService();
