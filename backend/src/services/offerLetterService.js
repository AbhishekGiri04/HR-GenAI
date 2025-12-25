const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class OfferLetterService {
  async generateAndSendOfferLetter(candidate, template, interviewResults) {
    try {
      // Check if candidate passed
      const overallScore = interviewResults.overallScore || candidate.overallScore || 0;
      
      if (overallScore < template.passingScore) {
        console.log(`Candidate ${candidate.personalInfo?.name} did not pass (${overallScore}% < ${template.passingScore}%)`);
        return { success: false, reason: 'Did not meet passing criteria' };
      }

      console.log(`✅ Generating offer letter for ${candidate.personalInfo?.name}`);

      // Generate PDF
      const pdfPath = await this.generateOfferLetterPDF(candidate, template, interviewResults);

      // Send email with PDF attachment
      await this.sendOfferLetterEmail(candidate, template, pdfPath);

      // Clean up PDF file
      fs.unlinkSync(pdfPath);

      return { success: true, message: 'Offer letter sent successfully' };
    } catch (error) {
      console.error('Error generating offer letter:', error);
      return { success: false, error: error.message };
    }
  }

  async generateOfferLetterPDF(candidate, template, interviewResults) {
    return new Promise((resolve, reject) => {
      const fileName = `offer_letter_${candidate._id}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/temp', fileName);

      // Ensure temp directory exists
      const tempDir = path.join(__dirname, '../../uploads/temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(24).fillColor('#667eea').text('OFFER LETTER', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).fillColor('#666').text('HR-GenAI Hiring Intelligence Platform', { align: 'center' });
      doc.moveDown(2);

      // Date
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.fontSize(10).fillColor('#333').text(`Date: ${today}`, { align: 'right' });
      doc.moveDown(2);

      // Candidate Details
      doc.fontSize(12).fillColor('#000').text(`Dear ${candidate.personalInfo?.name || 'Candidate'},`, { align: 'left' });
      doc.moveDown();

      // Congratulations
      doc.fontSize(11).fillColor('#333').text(
        `We are pleased to inform you that you have successfully completed the interview process for the position of ${template.name}. ` +
        `Based on your exceptional performance, we would like to extend an offer of employment.`,
        { align: 'justify' }
      );
      doc.moveDown(1.5);

      // Position Details Box
      doc.rect(50, doc.y, 495, 150).fillAndStroke('#f0f4ff', '#667eea');
      doc.fillColor('#000').fontSize(12).text('POSITION DETAILS', 60, doc.y - 140, { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(10).fillColor('#333');
      doc.text(`Position: ${template.name}`, 60);
      doc.text(`Department: Technology`, 60);
      doc.text(`Employment Type: Full-time`, 60);
      doc.text(`Start Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, 60);
      doc.moveDown(2);

      // Interview Performance
      doc.fontSize(12).fillColor('#000').text('INTERVIEW PERFORMANCE', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#333');
      doc.text(`Overall Score: ${interviewResults.overallScore || candidate.overallScore || 0}%`);
      doc.text(`Interview Type: ${template.interviewType.toUpperCase()}`);
      doc.text(`Difficulty Level: ${template.difficulty.toUpperCase()}`);
      doc.text(`Passing Criteria: ${template.passingScore}%`);
      doc.text(`Status: ✅ PASSED`, { color: '#10b981' });
      doc.moveDown(1.5);

      // Compensation (Sample)
      doc.fontSize(12).fillColor('#000').text('COMPENSATION & BENEFITS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#333');
      doc.text('• Competitive salary based on experience and market standards');
      doc.text('• Health insurance coverage');
      doc.text('• Performance-based bonuses');
      doc.text('• Professional development opportunities');
      doc.text('• Flexible working hours');
      doc.moveDown(1.5);

      // Next Steps
      doc.fontSize(12).fillColor('#000').text('NEXT STEPS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#333');
      doc.text('1. Review this offer letter carefully');
      doc.text('2. Reply to this email with your acceptance within 7 days');
      doc.text('3. Complete the onboarding documentation');
      doc.text('4. Attend the orientation session');
      doc.moveDown(1.5);

      // Closing
      doc.fontSize(11).fillColor('#333').text(
        'We are excited about the prospect of you joining our team and look forward to your positive response.',
        { align: 'justify' }
      );
      doc.moveDown(2);

      // Signature
      doc.fontSize(10).fillColor('#000');
      doc.text('Sincerely,');
      doc.moveDown(0.5);
      doc.text('HR Team');
      doc.text('HR-GenAI Platform');
      doc.moveDown(2);

      // Footer
      doc.fontSize(8).fillColor('#666').text(
        '---',
        { align: 'center' }
      );
      doc.text(
        'This is a computer-generated offer letter. For any queries, please contact hr@hrgenai.com',
        { align: 'center' }
      );

      doc.end();

      stream.on('finish', () => {
        console.log(`✅ PDF generated: ${filePath}`);
        resolve(filePath);
      });

      stream.on('error', reject);
    });
  }

  async sendOfferLetterEmail(candidate, template, pdfPath) {
    const mailOptions = {
      from: `"HR GenAI" <${process.env.EMAIL_USER}>`,
      to: candidate.email || candidate.personalInfo?.email,
      subject: `🎉 Congratulations! Offer Letter - ${template.name}`,
      html: this.generateOfferEmailHTML(candidate, template),
      attachments: [
        {
          filename: `Offer_Letter_${candidate.personalInfo?.name?.replace(/\s+/g, '_')}.pdf`,
          path: pdfPath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Offer letter email sent to ${candidate.email}`);
  }

  generateOfferEmailHTML(candidate, template) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .congrats { font-size: 48px; margin-bottom: 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="congrats">🎉</div>
            <h1>Congratulations!</h1>
            <p>You've Successfully Passed the Interview</p>
          </div>
          
          <div class="content">
            <h2>Dear ${candidate.personalInfo?.name},</h2>
            
            <p>We are thrilled to inform you that you have <strong>successfully passed</strong> the interview for the position of <strong>${template.name}</strong>!</p>
            
            <div class="info-box">
              <h3>🎯 Your Performance:</h3>
              <ul>
                <li><strong>Overall Score:</strong> ${candidate.overallScore || 0}%</li>
                <li><strong>Required Score:</strong> ${template.passingScore}%</li>
                <li><strong>Status:</strong> ✅ PASSED</li>
              </ul>
            </div>
            
            <div class="info-box">
              <h3>📄 Offer Letter Attached</h3>
              <p>Please find your official offer letter attached to this email. The offer letter contains:</p>
              <ul>
                <li>Position details and responsibilities</li>
                <li>Compensation and benefits</li>
                <li>Start date and next steps</li>
                <li>Terms and conditions</li>
              </ul>
            </div>
            
            <div class="info-box">
              <h3>📝 Next Steps:</h3>
              <ol>
                <li>Review the attached offer letter carefully</li>
                <li>Reply to this email with your acceptance within 7 days</li>
                <li>Complete the onboarding documentation</li>
                <li>Attend the orientation session</li>
              </ol>
            </div>
            
            <p>We are excited about the prospect of you joining our team and look forward to working with you!</p>
            
            <p>If you have any questions, please don't hesitate to reach out.</p>
            
            <p>Best regards,<br/>
            <strong>HR Team</strong><br/>
            HR-GenAI Platform</p>
          </div>
          
          <div class="footer">
            <p>© 2025 HR-GenAI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new OfferLetterService();
