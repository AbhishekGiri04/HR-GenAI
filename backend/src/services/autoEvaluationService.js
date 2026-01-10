const Candidate = require('../models/Candidate');
const InterviewEvaluationService = require('./interviewEvaluationService');
const LetterGenerationService = require('./letterGenerationService');
const emailService = require('./emailService');

class AutoEvaluationService {
    constructor() {
        this.evaluationService = new InterviewEvaluationService();
        this.letterService = new LetterGenerationService();
    }

    // Auto-evaluate candidate after interview completion
    async autoEvaluateCandidate(candidateId) {
        try {
            console.log(`🤖 Auto-evaluating candidate: ${candidateId}`);
            
            const candidate = await Candidate.findById(candidateId).populate('assignedTemplate');
            if (!candidate) {
                console.error('Candidate not found for auto-evaluation');
                return;
            }

            // Check if already evaluated
            if (candidate.interviewScore) {
                console.log('Candidate already evaluated, skipping');
                return;
            }

            // Evaluate candidate
            const evaluation = this.evaluationService.evaluateCandidate(candidate);
            
            // Update candidate with evaluation results
            await Candidate.findByIdAndUpdate(candidateId, {
                interviewScore: evaluation.interviewScore,
                growthPotential: evaluation.growthPotential,
                retentionScore: evaluation.retentionScore,
                interviewCompleted: true,
                status: 'completed',
                aiHireStatus: evaluation.passed ? 'offered' : 'rejected'
            });

            // Generate and send appropriate letter
            const updatedCandidate = await Candidate.findById(candidateId);
            
            if (evaluation.passed) {
                console.log(`✅ Candidate passed (${evaluation.interviewScore}/100) - Sending offer letter`);
                await this.sendOfferLetter(updatedCandidate);
            } else {
                console.log(`❌ Candidate failed (${evaluation.interviewScore}/100) - Sending rejection letter`);
                await this.sendRejectionLetter(updatedCandidate);
            }

            console.log(`🎯 Auto-evaluation completed for ${candidate.name}`);
            return evaluation;

        } catch (error) {
            console.error('Auto-evaluation error:', error);
        }
    }

    async sendOfferLetter(candidate) {
        try {
            const letterResult = await this.letterService.generateOfferLetter(candidate);
            await emailService.sendOfferEmail(candidate, letterResult.filePath);
            console.log(`📧 Offer letter sent to ${candidate.email}`);
        } catch (error) {
            console.error('Offer letter error:', error);
        }
    }

    async sendRejectionLetter(candidate) {
        try {
            const letterResult = await this.letterService.generateRejectionLetter(candidate);
            await emailService.sendRejectionEmail(candidate, letterResult.filePath);
            console.log(`📧 Rejection letter sent to ${candidate.email}`);
        } catch (error) {
            console.error('Rejection letter error:', error);
        }
    }

    // Batch process all pending candidates
    async processPendingCandidates() {
        try {
            const pendingCandidates = await Candidate.find({
                interviewCompleted: true,
                interviewScore: { $exists: false }
            });

            console.log(`🔄 Processing ${pendingCandidates.length} pending candidates`);

            for (const candidate of pendingCandidates) {
                await this.autoEvaluateCandidate(candidate._id);
                // Small delay to avoid overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

        } catch (error) {
            console.error('Batch processing error:', error);
        }
    }
}

module.exports = AutoEvaluationService;