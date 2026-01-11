const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class LetterGenerationService {
    constructor() {
        this.companyName = 'HR-GenAI';
        this.companyAddress = 'AI-Powered Hiring Intelligence Platform';
    }

    // Generate offer letter PDF
    async generateOfferLetter(candidate, jobDetails = {}) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ 
                    margin: 40,
                    size: 'A4'
                });
                const fileName = `offer_letter_${candidate.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
                const filePath = path.join(__dirname, '../../uploads/letters', fileName);

                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Professional Header with gradient effect
                doc.rect(0, 0, doc.page.width, 80).fill('#667eea');
                doc.fontSize(24).fillColor('#ffffff').font('Helvetica-Bold')
                   .text('HR-GenAI', 40, 25);
                doc.fontSize(10).fillColor('#ffffff').font('Helvetica')
                   .text('AI-Powered Hiring Intelligence Platform', 40, 55);
                
                // Date - top right
                doc.fontSize(9).fillColor('#666666')
                   .text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 
                   doc.page.width - 200, 100, { align: 'right', width: 160 });
                
                doc.moveDown(3);

                // Candidate Info - compact
                doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold')
                   .text(candidate.name, 40, 130);
                doc.fontSize(9).fillColor('#666666').font('Helvetica')
                   .text(`${candidate.email} | ${candidate.phone || 'N/A'}`, 40, 145);
                if (candidate.location) {
                    doc.text(candidate.location, 40, 158);
                }

                // Subject Line
                doc.fontSize(12).fillColor('#667eea').font('Helvetica-Bold')
                   .text('OFFER OF EMPLOYMENT', 40, 185);
                
                doc.moveDown(1.5);

                // Greeting
                doc.fontSize(10).fillColor('#000000').font('Helvetica')
                   .text(`Dear ${candidate.name},`, 40, doc.y);
                
                doc.moveDown(0.8);

                // Main content - concise
                doc.fontSize(9.5).fillColor('#333333')
                   .text('We are delighted to extend an offer of employment based on your outstanding performance in our AI-powered interview process. Your skills and experience make you an excellent fit for our team.', 
                   40, doc.y, { width: 515, align: 'justify' });
                
                doc.moveDown(1);

                // Two-column layout for results and position
                const leftCol = 40;
                const rightCol = 310;
                const startY = doc.y;

                // Left: Interview Results Box
                doc.rect(leftCol, startY, 250, 95).fillAndStroke('#f0f4ff', '#667eea');
                doc.fontSize(10).fillColor('#667eea').font('Helvetica-Bold')
                   .text('Interview Performance', leftCol + 10, startY + 10);
                doc.fontSize(9).fillColor('#000000').font('Helvetica')
                   .text(`Overall Score: ${candidate.interviewScore || 'N/A'}/100`, leftCol + 10, startY + 28)
                   .text(`Growth Potential: ${candidate.growthPotential || 'High'}`, leftCol + 10, startY + 43)
                   .text(`Retention Score: ${candidate.retentionScore || 'High'}`, leftCol + 10, startY + 58)
                   .text(`Assessment: ${candidate.interviewSummary?.verdict || 'Strong Hire'}`, leftCol + 10, startY + 73);

                // Right: Position Details Box
                doc.rect(rightCol, startY, 245, 95).fillAndStroke('#f0fff4', '#10b981');
                doc.fontSize(10).fillColor('#10b981').font('Helvetica-Bold')
                   .text('Position Details', rightCol + 10, startY + 10);
                doc.fontSize(9).fillColor('#000000').font('Helvetica')
                   .text(`Role: ${jobDetails.position || candidate.appliedFor || 'Software Developer'}`, rightCol + 10, startY + 28)
                   .text(`Department: ${jobDetails.department || 'Technology'}`, rightCol + 10, startY + 43)
                   .text(`Start Date: ${jobDetails.startDate || 'To be discussed'}`, rightCol + 10, startY + 58)
                   .text(`Compensation: ${jobDetails.salary || 'As per standards'}`, rightCol + 10, startY + 73);

                doc.y = startY + 110;

                // Next Steps - compact list
                doc.fontSize(10).fillColor('#667eea').font('Helvetica-Bold')
                   .text('Next Steps', 40, doc.y);
                doc.fontSize(9).fillColor('#333333').font('Helvetica');
                const steps = [
                    'Confirm acceptance within 7 business days',
                    'Complete background verification',
                    'HR will contact you for onboarding'
                ];
                steps.forEach((step, i) => {
                    doc.text(`${i + 1}. ${step}`, 40, doc.y + 5, { width: 515 });
                });

                doc.moveDown(1.2);

                // Closing
                doc.fontSize(9.5).fillColor('#333333')
                   .text('We are excited to welcome you to our team and look forward to your valuable contributions.', 
                   40, doc.y, { width: 515, align: 'justify' });
                
                doc.moveDown(1.5);

                // Signature
                doc.fontSize(10).fillColor('#000000').font('Helvetica')
                   .text('Best regards,', 40, doc.y);
                doc.fontSize(10).font('Helvetica-Bold')
                   .text('HR Team', 40, doc.y + 5)
                   .text('HR-GenAI', 40, doc.y + 5);

                // Footer
                doc.fontSize(8).fillColor('#999999').font('Helvetica')
                   .text('This offer letter is generated by HR-GenAI AI-powered platform. For queries, contact hr@hrgenai.com', 
                   40, doc.page.height - 60, { width: 515, align: 'center' });

                doc.end();

                stream.on('finish', () => {
                    resolve({ filePath, fileName });
                });

                stream.on('error', reject);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Generate rejection letter PDF
    async generateRejectionLetter(candidate) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ 
                    margin: 40,
                    size: 'A4'
                });
                const fileName = `rejection_letter_${candidate.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
                const filePath = path.join(__dirname, '../../uploads/letters', fileName);

                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Professional Header
                doc.rect(0, 0, doc.page.width, 80).fill('#667eea');
                doc.fontSize(24).fillColor('#ffffff').font('Helvetica-Bold')
                   .text('HR-GenAI', 40, 25);
                doc.fontSize(10).fillColor('#ffffff').font('Helvetica')
                   .text('AI-Powered Hiring Intelligence Platform', 40, 55);
                
                // Date
                doc.fontSize(9).fillColor('#666666')
                   .text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 
                   doc.page.width - 200, 100, { align: 'right', width: 160 });
                
                doc.moveDown(3);

                // Candidate Info
                doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold')
                   .text(candidate.name, 40, 130);
                doc.fontSize(9).fillColor('#666666').font('Helvetica')
                   .text(`${candidate.email} | ${candidate.phone || 'N/A'}`, 40, 145);
                if (candidate.location) {
                    doc.text(candidate.location, 40, 158);
                }

                // Subject Line
                doc.fontSize(12).fillColor('#667eea').font('Helvetica-Bold')
                   .text('INTERVIEW RESULTS', 40, 185);
                
                doc.moveDown(1.5);

                // Greeting
                doc.fontSize(10).fillColor('#000000').font('Helvetica')
                   .text(`Dear ${candidate.name},`, 40, doc.y);
                
                doc.moveDown(0.8);

                // Main content
                doc.fontSize(9.5).fillColor('#333333')
                   .text('Thank you for your interest in our organization and for taking the time to participate in our AI-powered interview process. We appreciate the effort you invested in showcasing your skills.', 
                   40, doc.y, { width: 515, align: 'justify' });
                
                doc.moveDown(1);

                // Interview Results Box
                doc.rect(40, doc.y, 515, 85).fillAndStroke('#fef3c7', '#f59e0b');
                const boxY = doc.y;
                doc.fontSize(10).fillColor('#92400e').font('Helvetica-Bold')
                   .text('Interview Performance Summary', 50, boxY + 10);
                doc.fontSize(9).fillColor('#000000').font('Helvetica')
                   .text(`Overall Score: ${candidate.interviewScore || 'N/A'}/100`, 50, boxY + 28)
                   .text(`Growth Potential: ${candidate.growthPotential || 'Moderate'}`, 50, boxY + 43)
                   .text(`Areas of Strength: ${candidate.interviewSummary?.strengths?.slice(0, 2).join(', ') || 'Multiple areas assessed'}`, 50, boxY + 58, { width: 505 });

                doc.y = boxY + 95;

                // Decision
                doc.fontSize(9.5).fillColor('#333333').font('Helvetica')
                   .text('After careful consideration of your interview performance and our current requirements, we have decided to move forward with other candidates whose qualifications more closely align with our immediate needs.', 
                   40, doc.y, { width: 515, align: 'justify' });
                
                doc.moveDown(1);

                // Recommendations Box
                doc.rect(40, doc.y, 515, 70).fillAndStroke('#dbeafe', '#3b82f6');
                const recY = doc.y;
                doc.fontSize(10).fillColor('#1e40af').font('Helvetica-Bold')
                   .text('Recommendations for Growth', 50, recY + 10);
                doc.fontSize(9).fillColor('#000000').font('Helvetica');
                const recommendations = [
                    'Continue developing technical and soft skills',
                    'Consider additional certifications in your field',
                    'Apply for future opportunities that match your profile'
                ];
                recommendations.forEach((rec, i) => {
                    doc.text(`${i + 1}. ${rec}`, 50, recY + 28 + (i * 14), { width: 505 });
                });

                doc.y = recY + 80;

                // Closing
                doc.fontSize(9.5).fillColor('#333333').font('Helvetica')
                   .text('We encourage you to continue your professional development and wish you the very best in your career endeavors. Thank you once again for your time and interest.', 
                   40, doc.y, { width: 515, align: 'justify' });
                
                doc.moveDown(1.5);

                // Signature
                doc.fontSize(10).fillColor('#000000').font('Helvetica')
                   .text('Best regards,', 40, doc.y);
                doc.fontSize(10).font('Helvetica-Bold')
                   .text('HR Team', 40, doc.y + 5)
                   .text('HR-GenAI', 40, doc.y + 5);

                // Footer
                doc.fontSize(8).fillColor('#999999').font('Helvetica')
                   .text('This letter is generated by HR-GenAI AI-powered platform. For queries, contact hr@hrgenai.com', 
                   40, doc.page.height - 60, { width: 515, align: 'center' });

                doc.end();

                stream.on('finish', () => {
                    resolve({ filePath, fileName });
                });

                stream.on('error', reject);

            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = LetterGenerationService;