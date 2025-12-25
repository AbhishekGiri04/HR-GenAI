class AdaptiveInterviewer {
  // Simple methods without AI dependency for now
  async generateFollowUpQuestion(answer, originalQuestion, candidateProfile) {
    return {
      followUpQuestion: "Can you elaborate on that?",
      reason: "Need more details",
      detectionFlags: {
        overConfident: false,
        vague: false,
        needsProof: false
      }
    };
  }

  async analyzeAnswerQuality(answer, question) {
    return {
      confidenceLevel: 7,
      clarity: 8,
      depth: 6,
      honesty: 8,
      redFlags: [],
      strengths: ["Clear communication"],
      bluffingIndicators: {
        vagueAnswers: false,
        overUseOfBuzzwords: false,
        contradictions: false,
        lackOfExamples: false
      }
    };
  }

  async detectPersonality(allAnswers) {
    return {
      mbti: "INTJ",
      ocean: {
        openness: 7,
        conscientiousness: 8,
        extraversion: 6,
        agreeableness: 7,
        neuroticism: 4
      },
      traits: {
        leadership: 7,
        teamOrientation: 8,
        riskTaking: 6,
        analytical: 9,
        creative: 7
      },
      workStyle: "hybrid",
      bestFitRoles: ["Software Developer", "Technical Lead"]
    };
  }

  async generateHiringProbability(candidate) {
    return {
      hiringProbability: 85,
      breakdown: {
        skillScore: 40,
        communication: 20,
        eqStress: 15,
        personalityFit: 15,
        cultureMatch: 10
      },
      predictions: {
        willStay6Months: 90,
        trainingRequired: "low",
        teamMismatchRisk: 15,
        burnoutRisk: 20
      },
      recommendation: "hire",
      reasons: ["Strong technical skills", "Good communication"]
    };
  }

  async generateInterviewSummary(candidate, allAnswers) {
    return {
      summary: "Strong candidate with good technical and communication skills",
      strengths: ["Technical expertise", "Clear communication", "Problem solving"],
      weaknesses: ["Could improve leadership experience"],
      recommendedRole: "Software Developer",
      verdict: "Hire",
      keyInsights: ["Shows strong potential", "Good cultural fit"],
      nextSteps: ["Technical round", "Reference check"]
    };
  }
}

module.exports = new AdaptiveInterviewer();