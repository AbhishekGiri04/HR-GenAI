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
        
        // If passed, send offer letter PDF
        if (passed) {
          await this.sendOfferLetter(candidate, summary);
        }
      }
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  async sendOfferLetter(candidate, summary) {
    try {
      const PDFDocument = require('pdfkit');
      const fs = require('fs');
      const path = require('path');

      const doc = new PDFDocument({ margin: 50 });
      const fileName = `offer_letter_${candidate._id}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/temp', fileName);

      doc.pipe(fs.createWriteStream(filePath));

      // Header
      doc.fontSize(20).text('OFFER LETTER', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);

      // Candidate Info
      doc.fontSize(14).text(`Dear ${candidate.name},`);
      doc.moveDown();
      doc.fontSize(12).text(`We are pleased to offer you the position of ${candidate.appliedFor || 'Software Developer'} at our organization.`);
      doc.moveDown();

      // Interview Results
      doc.text(`Your interview performance was exceptional:`);
      doc.moveDown(0.5);
      doc.text(`• Overall Score: ${candidate.skillDNA?.overallScore || 'N/A'}/100`);
      doc.text(`• EQ Score: ${candidate.eqAnalysis?.overallEQ || 'N/A'}/10`);
      doc.text(`• Personality Type: ${candidate.personality?.mbti || 'N/A'}`);
      doc.text(`• Verdict: ${summary?.verdict || 'Qualified'}`);
      doc.moveDown();

      // Offer Details
      doc.text('Position Details:');
      doc.moveDown(0.5);
      doc.text(`• Role: ${candidate.appliedFor || 'Software Developer'}`);
      doc.text(`• Start Date: To be discussed`);
      doc.text(`• Employment Type: Full-time`);
      doc.moveDown();

      // Next Steps
      doc.text('Next Steps:');
      doc.moveDown(0.5);
      doc.text('1. Review this offer letter carefully');
      doc.text('2. Contact our HR team to discuss terms');
      doc.text('3. Complete onboarding documentation');
      doc.moveDown(2);

      // Footer
      doc.text('Congratulations on your success!');
      doc.moveDown();
      doc.text('Best regards,');
      doc.text('HR Team');
      doc.text('HR-GenAI Platform');

      doc.end();

      // Wait for PDF to be written
      await new Promise((resolve) => {
        doc.on('end', resolve);
      });

      // Send email with PDF attachment
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: candidate.email,
        subject: `🎉 Offer Letter - ${candidate.appliedFor || 'Position'}`,
        html: `
          <h2>Congratulations ${candidate.name}!</h2>
          <p>Please find your offer letter attached.</p>
          <p>We look forward to having you on our team!</p>
          <br>
          <p>Best regards,<br>HR Team</p>
        `,
        attachments: [
          {
            filename: fileName,
            path: filePath
          }
        ]
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📜 Offer letter sent to ${candidate.email}`);

      // Clean up temp file
      fs.unlinkSync(filePath);

      return true;
    } catch (error) {
      console.error('❌ Offer letter error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
