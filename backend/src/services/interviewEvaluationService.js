class InterviewEvaluationService {
    constructor() {
        this.passingScore = 70; // Default passing score
    }

    // Calculate comprehensive interview score
    calculateInterviewScore(candidate) {
        let totalScore = 0;
        let components = 0;

        // Technical Skills Score (30%)
        if (candidate.skillDNA?.overallScore) {
            totalScore += candidate.skillDNA.overallScore * 0.3;
            components++;
        }

        // EQ Analysis Score (25%)
        if (candidate.eqAnalysis?.overallEQ) {
            const eqScore = (candidate.eqAnalysis.overallEQ / 10) * 100;
            totalScore += eqScore * 0.25;
            components++;
        }

        // Behavior DNA Score (25%)
        if (candidate.behaviorDNA?.overall_behavior_score) {
            totalScore += candidate.behaviorDNA.overall_behavior_score * 0.25;
            components++;
        }

        // Interview Responses Score (20%)
        if (candidate.interviewResponses?.length > 0) {
            // Calculate score based on response quality and completeness
            const responseScore = Math.min(85, 60 + (candidate.interviewResponses.length * 5));
            totalScore += responseScore * 0.2;
            components++;
        }

        // If interview completed but no detailed analysis, use base score
        if (components === 0 && candidate.interviewCompleted) {
            return 75; // Default decent score for completed interviews
        }

        return components > 0 ? Math.round(totalScore / components) : 0;
    }

    // Calculate growth potential
    calculateGrowthPotential(candidate) {
        let growthScore = 0;
        let factors = 0;

        // Base on interview score
        if (candidate.interviewScore) {
            growthScore += Math.min(95, candidate.interviewScore + 15);
            factors++;
        }

        // Learning velocity from skillDNA
        if (candidate.skillDNA?.learningVelocity) {
            growthScore += candidate.skillDNA.learningVelocity;
            factors++;
        }

        // Personality traits that indicate growth
        if (candidate.personality?.ocean) {
            const openness = candidate.personality.ocean.openness || 0;
            const conscientiousness = candidate.personality.ocean.conscientiousness || 0;
            growthScore += (openness + conscientiousness) / 2;
            factors++;
        }

        // EQ breakdown for adaptability
        if (candidate.eqAnalysis?.breakdown) {
            const adaptability = (candidate.eqAnalysis.breakdown.emotionalIntelligence || 0) / 10 * 100;
            growthScore += adaptability;
            factors++;
        }

        // Default based on interview performance
        if (factors === 0 && candidate.interviewScore) {
            return Math.min(95, candidate.interviewScore + 20);
        }

        return factors > 0 ? Math.round(growthScore / factors) : 85;
    }

    // Calculate retention score
    calculateRetentionScore(candidate) {
        let retentionScore = 0;
        let factors = 0;

        // Base on interview score
        if (candidate.interviewScore) {
            retentionScore += Math.min(95, candidate.interviewScore + 10);
            factors++;
        }

        // Emotional stability
        if (candidate.behaviorDNA?.emotional_stability) {
            retentionScore += candidate.behaviorDNA.emotional_stability;
            factors++;
        }

        // Team collaboration
        if (candidate.behaviorDNA?.team_collaboration) {
            retentionScore += candidate.behaviorDNA.team_collaboration;
            factors++;
        }

        // Culture fit
        if (candidate.cultureFit?.overall_fit_score) {
            retentionScore += candidate.cultureFit.overall_fit_score;
            factors++;
        }

        // Default based on interview performance
        if (factors === 0 && candidate.interviewScore) {
            return Math.min(95, candidate.interviewScore + 15);
        }

        return factors > 0 ? Math.round(retentionScore / factors) : 88;
    }

    // Determine if candidate passed
    isPassed(score, templatePassingScore = null) {
        const threshold = templatePassingScore || this.passingScore;
        return score >= threshold;
    }

    // Get evaluation verdict
    getVerdict(score) {
        if (score >= 90) return 'Strong Hire';
        if (score >= 80) return 'Hire';
        if (score >= 70) return 'Maybe';
        return 'Reject';
    }

    // Complete evaluation for a candidate
    evaluateCandidate(candidate) {
        const interviewScore = this.calculateInterviewScore(candidate);
        const growthPotential = this.calculateGrowthPotential(candidate);
        const retentionScore = this.calculateRetentionScore(candidate);
        
        const templatePassingScore = candidate.assignedTemplate?.passingScore;
        const passed = this.isPassed(interviewScore, templatePassingScore);
        const verdict = this.getVerdict(interviewScore);

        return {
            interviewScore,
            growthPotential,
            retentionScore,
            passed,
            verdict,
            evaluatedAt: new Date()
        };
    }
}

module.exports = InterviewEvaluationService;