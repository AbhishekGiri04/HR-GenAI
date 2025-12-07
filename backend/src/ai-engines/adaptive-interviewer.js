const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AdaptiveInterviewer {
  async generateFollowUpQuestion(answer, originalQuestion, candidateProfile) {
    try {
      const prompt = `
You are an expert HR interviewer. Based on the candidate's answer, generate a smart follow-up question.

Original Question: ${originalQuestion}
Candidate's Answer: ${answer}
Candidate Skills: ${candidateProfile.technicalSkills?.join(', ')}

Generate ONE follow-up question that:
1. Digs deeper into their answer
2. Tests their actual knowledge
3. Reveals if they're bluffing

Return JSON:
{
  "followUpQuestion": "your question here",
  "reason": "why you're asking this",
  "detectionFlags": {
    "overConfident": true/false,
    "vague": true/false,
    "needsProof": true/false
  }
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Follow-up generation error:', error);
      return null;
    }
  }

  async analyzeAnswerQuality(answer, question) {
    try {
      const prompt = `
Analyze this interview answer for quality and honesty:

Question: ${question}
Answer: ${answer}

Return JSON:
{
  "confidenceLevel": 1-10,
  "clarity": 1-10,
  "depth": 1-10,
  "honesty": 1-10,
  "redFlags": ["flag1", "flag2"],
  "strengths": ["strength1", "strength2"],
  "bluffingIndicators": {
    "vagueAnswers": true/false,
    "overUseOfBuzzwords": true/false,
    "contradictions": true/false,
    "lackOfExamples": true/false
  }
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Answer analysis error:', error);
      return null;
    }
  }

  async detectPersonality(allAnswers) {
    try {
      const prompt = `
Based on these interview answers, determine personality traits:

Answers: ${JSON.stringify(allAnswers)}

Return JSON:
{
  "mbti": "INTJ/ENFP/etc",
  "ocean": {
    "openness": 1-10,
    "conscientiousness": 1-10,
    "extraversion": 1-10,
    "agreeableness": 1-10,
    "neuroticism": 1-10
  },
  "traits": {
    "leadership": 1-10,
    "teamOrientation": 1-10,
    "riskTaking": 1-10,
    "analytical": 1-10,
    "creative": 1-10
  },
  "workStyle": "individual/team/hybrid",
  "bestFitRoles": ["role1", "role2"]
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Personality detection error:', error);
      return null;
    }
  }

  async generateHiringProbability(candidate) {
    try {
      const prompt = `
Calculate hiring probability and predictions:

Candidate Data: ${JSON.stringify(candidate)}

Return JSON:
{
  "hiringProbability": 1-100,
  "breakdown": {
    "skillScore": 40,
    "communication": 20,
    "eqStress": 15,
    "personalityFit": 15,
    "cultureMatch": 10
  },
  "predictions": {
    "willStay6Months": 1-100,
    "trainingRequired": "low/medium/high",
    "teamMismatchRisk": 1-100,
    "burnoutRisk": 1-100
  },
  "recommendation": "hire/reject/maybe",
  "reasons": ["reason1", "reason2"]
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Hiring probability error:', error);
      return null;
    }
  }

  async generateInterviewSummary(candidate, allAnswers) {
    try {
      const prompt = `
Generate a concise interview summary for HR:

Candidate: ${candidate.name}
Skills: ${candidate.skillDNA?.technicalSkills?.join(', ')}
Interview Answers: ${JSON.stringify(allAnswers)}

Return JSON:
{
  "summary": "2-3 line summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendedRole": "role name",
  "verdict": "Strong Hire/Hire/Maybe/Reject",
  "keyInsights": ["insight1", "insight2"],
  "nextSteps": ["step1", "step2"]
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Summary generation error:', error);
      return null;
    }
  }
}

module.exports = new AdaptiveInterviewer();
