const AutoEvaluationService = require('../services/autoEvaluationService');

class InterviewCompletionHandler {
    constructor() {
        this.autoEvalService = new AutoEvaluationService();
    }

    // Call this when an interview is completed
    async handleInterviewCompletion(candidateId) {
        try {
            console.log(`🎯 Interview completed for candidate: ${candidateId}`);
            
            // Small delay to ensure all data is saved
            setTimeout(async () => {
                await this.autoEvalService.autoEvaluateCandidate(candidateId);
            }, 2000);

        } catch (error) {
            console.error('Interview completion handler error:', error);
        }
    }

    // Batch process all completed interviews
    async processAllCompleted() {
        try {
            await this.autoEvalService.processPendingCandidates();
        } catch (error) {
            console.error('Batch process error:', error);
        }
    }
}

// Global instance
const interviewHandler = new InterviewCompletionHandler();

// Auto-process every 5 minutes
setInterval(() => {
    console.log('🔄 Running auto-evaluation check...');
    interviewHandler.processAllCompleted();
}, 5 * 60 * 1000); // 5 minutes

module.exports = interviewHandler;