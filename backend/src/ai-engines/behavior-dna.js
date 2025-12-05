const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class BehaviorDNAEngine {
  async analyzeBehavior(interviewResponses) {
    try {
      const prompt = `
        Analyze these interview responses for behavioral patterns:
        
        Responses: ${JSON.stringify(interviewResponses)}
        
        Return JSON with:
        {
          "stressResponse": 1-10,
          "ownership": 1-10,
          "teamwork": 1-10,
          "communication": 1-10,
          "problemSolving": 1-10,
          "adaptability": 1-10,
          "leadership": 1-10,
          "overallScore": 1-100,
          "behaviorProfile": "description",
          "redFlags": ["flag1", "flag2"],
          "strengths": ["strength1", "strength2"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Behavior DNA analysis error:', error);
      return this.getDefaultBehaviorDNA();
    }
  }

  generateInterviewQuestions() {
    return [
      {
        id: 1,
        question: "Describe a time when you had to work under extreme pressure. How did you handle it?",
        type: "stress_response"
      },
      {
        id: 2,
        question: "Tell me about a project that failed. What was your role and what did you learn?",
        type: "ownership"
      },
      {
        id: 3,
        question: "How do you handle conflicts within a team?",
        type: "teamwork"
      },
      {
        id: 4,
        question: "Describe a complex problem you solved recently. Walk me through your approach.",
        type: "problem_solving"
      }
    ];
  }

  getDefaultBehaviorDNA() {
    return {
      stressResponse: 5,
      ownership: 5,
      teamwork: 5,
      communication: 5,
      problemSolving: 5,
      adaptability: 5,
      leadership: 5,
      overallScore: 50,
      behaviorProfile: "Analysis pending",
      redFlags: [],
      strengths: []
    };
  }
}

module.exports = new BehaviorDNAEngine();