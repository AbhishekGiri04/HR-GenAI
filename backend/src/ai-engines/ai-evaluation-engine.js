const OpenAI = require('openai');
const axios = require('axios');

class AIEvaluationEngine {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.geminiApiKey = process.env.GEMINI_API_KEY;
  }

  async evaluateSession(session) {
    try {
      if (this.geminiApiKey) {
        return await this.evaluateWithGemini(session);
      } else if (process.env.OPENAI_API_KEY) {
        return await this.evaluateWithOpenAI(session);
      } else {
        return this.heuristicEvaluation(session);
      }
    } catch (error) {
      console.error('AI Evaluation failed, using heuristic:', error.message);
      return this.heuristicEvaluation(session);
    }
  }

  async evaluateWithGemini(session) {
    const { questions, answers, candidate } = session;
    
    const prompt = this.buildEvaluationPrompt(questions, answers, candidate);
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return this.parseEvaluationResponse(rawText, questions.length);
  }

  async evaluateWithOpenAI(session) {
    const { questions, answers, candidate } = session;
    
    const prompt = this.buildEvaluationPrompt(questions, answers, candidate);
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    const rawText = response.choices[0].message.content;
    return this.parseEvaluationResponse(rawText, questions.length);
  }

  buildEvaluationPrompt(questions, answers, candidate) {
    const candidateName = candidate?.personalInfo?.name || 'Candidate';
    const candidateSkills = candidate?.technicalSkills?.join(', ') || 'General skills';
    
    let prompt = `You are an expert technical interviewer. Evaluate this interview session and return ONLY valid JSON.

Candidate: ${candidateName}
Technical Skills: ${candidateSkills}

Format:
{
  "perAnswer": [
    {"index": 0, "score": 8, "feedback": "Good explanation of concepts", "strengths": ["Clear communication"], "improvements": ["Add more examples"]}
  ],
  "overall": {
    "score": 75,
    "summary": "Strong technical knowledge with room for improvement",
    "strengths": ["Technical depth", "Problem-solving"],
    "improvements": ["Communication clarity", "Real-world examples"],
    "recommendation": "Proceed to next round"
  }
}

Evaluate each answer (0-10 scale) and provide overall assessment (0-100 scale):

`;

    questions.forEach((question, index) => {
      const answer = answers[index];
      const answerText = answer?.text || 'No answer provided';
      const timeSpent = answer?.timeSpent || 0;
      const isAutoSubmitted = answer?.isAutoSubmitted || false;
      
      prompt += `Q${index + 1} [${question.difficulty}]: ${question.text}\n`;
      prompt += `A${index + 1}: ${answerText}\n`;
      prompt += `Time spent: ${timeSpent}s${isAutoSubmitted ? ' (auto-submitted)' : ''}\n\n`;
    });

    prompt += `\nConsider:
- Technical accuracy and depth
- Communication clarity
- Problem-solving approach
- Time management
- Completeness of answers
- Relevance to the role

Return only the JSON object.`;

    return prompt;
  }

  parseEvaluationResponse(rawText, questionCount) {
    try {
      let jsonStr = rawText;
      
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      const objectMatch = jsonStr.match(/(\{[\s\S]*\})/i);
      if (objectMatch) {
        jsonStr = objectMatch[1];
      }
      
      const parsed = JSON.parse(jsonStr);
      
      return this.normalizeEvaluation(parsed, questionCount);
    } catch (error) {
      console.error('Failed to parse AI evaluation response:', error.message);
      console.log('Raw response:', rawText.substring(0, 500));
      throw new Error('Invalid AI evaluation response format');
    }
  }

  normalizeEvaluation(parsed, questionCount) {
    const perAnswer = [];
    
    for (let i = 0; i < questionCount; i++) {
      const existing = parsed.perAnswer?.find(item => item.index === i);
      
      perAnswer.push({
        index: i,
        score: this.validateScore(existing?.score, 0, 10) || 5,
        feedback: existing?.feedback || 'No specific feedback provided',
        strengths: existing?.strengths || [],
        improvements: existing?.improvements || []
      });
    }
    
    let overallScore = parsed.overall?.score;
    if (!overallScore) {
      const avgScore = perAnswer.reduce((sum, item) => sum + item.score, 0) / questionCount;
      overallScore = Math.round(avgScore * 10);
    }
    
    const overall = {
      score: this.validateScore(overallScore, 0, 100) || 50,
      summary: parsed.overall?.summary || 'Interview evaluation completed',
      strengths: parsed.overall?.strengths || ['Participated in interview'],
      improvements: parsed.overall?.improvements || ['Continue learning'],
      recommendation: parsed.overall?.recommendation || 'Review performance'
    };
    
    return { perAnswer, overall };
  }

  validateScore(score, min, max) {
    const num = Number(score);
    if (isNaN(num)) return null;
    return Math.max(min, Math.min(max, num));
  }

  heuristicEvaluation(session) {
    const { questions, answers } = session;
    const perAnswer = [];
    let totalScore = 0;
    
    questions.forEach((question, index) => {
      const answer = answers[index];
      const answerText = answer?.text || '';
      const timeSpent = answer?.timeSpent || 0;
      const isAutoSubmitted = answer?.isAutoSubmitted || false;
      
      let score = 0;
      let feedback = '';
      
      if (!answerText.trim()) {
        score = 0;
        feedback = 'No answer provided';
      } else {
        const wordCount = answerText.trim().split(/\s+/).length;
        const hasExamples = /example|instance|case|scenario/i.test(answerText);
        const hasTechnicalTerms = /algorithm|function|method|class|object|array|database/i.test(answerText);
        
        if (wordCount < 10) {
          score = 2;
          feedback = 'Very brief answer, needs more detail';
        } else if (wordCount < 30) {
          score = 4;
          feedback = 'Short answer, could use more explanation';
        } else if (wordCount < 80) {
          score = 6;
          feedback = 'Adequate answer length';
        } else {
          score = 7;
          feedback = 'Good detailed answer';
        }
        
        if (hasExamples) score += 1;
        if (hasTechnicalTerms) score += 1;
        
        if (isAutoSubmitted) {
          score = Math.max(1, score - 2);
          feedback += ' (time expired)';
        }
        
        const difficultyMultiplier = {
          'easy': 1.0,
          'medium': 1.1,
          'hard': 1.2
        };
        
        score = Math.min(10, Math.round(score * (difficultyMultiplier[question.difficulty] || 1.0)));
      }
      
      perAnswer.push({
        index,
        score,
        feedback,
        strengths: score >= 7 ? ['Good understanding'] : [],
        improvements: score < 5 ? ['Needs more detail', 'Practice explaining concepts'] : []
      });
      
      totalScore += score;
    });
    
    const averageScore = totalScore / questions.length;
    const overallScore = Math.round(averageScore * 10);
    
    let recommendation = 'Needs improvement';
    if (overallScore >= 80) recommendation = 'Excellent - Highly recommended';
    else if (overallScore >= 70) recommendation = 'Good - Recommended';
    else if (overallScore >= 60) recommendation = 'Average - Consider for next round';
    else if (overallScore >= 50) recommendation = 'Below average - Additional training needed';
    
    const overall = {
      score: overallScore,
      summary: `Completed interview with ${Math.round(averageScore * 10)}% performance`,
      strengths: overallScore >= 70 ? ['Consistent performance', 'Good participation'] : ['Participated in interview'],
      improvements: overallScore < 70 ? ['Improve technical knowledge', 'Practice communication', 'Provide more detailed answers'] : ['Continue learning'],
      recommendation
    };
    
    return { perAnswer, overall };
  }
}

module.exports = new AIEvaluationEngine();