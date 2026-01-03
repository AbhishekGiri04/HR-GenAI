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
      model: "gpt-3.5-turbo",
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
    
    let prompt = `You are a STRICT technical interviewer. Evaluate this interview session critically and return ONLY valid JSON.

Candidate: ${candidateName}
Technical Skills: ${candidateSkills}

IMPORTANT EVALUATION RULES:
1. Give 0 marks if answer is irrelevant, wrong, or nonsense
2. Give 0-3 marks if answer is partially correct but lacks depth
3. Give 4-6 marks if answer is correct but missing key points
4. Give 7-8 marks if answer is good with minor issues
5. Give 9-10 marks only if answer is excellent and complete
6. Check if answer actually addresses the question asked
7. Verify technical accuracy - wrong technical info = 0 marks
8. Random text or copy-paste = 0 marks

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

Evaluate each answer STRICTLY (0-10 scale) and provide overall assessment (0-100 scale):

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

    prompt += `\nSTRICT EVALUATION CRITERIA:
- Technical accuracy: Wrong answer = 0 marks
- Relevance: Off-topic answer = 0 marks  
- Depth: Shallow/generic answer = max 3 marks
- Completeness: Missing key concepts = max 5 marks
- Quality: Random text/gibberish = 0 marks
- Communication: Unclear explanation = reduce marks

Be HARSH but FAIR. Most candidates should score 40-60%. Only exceptional answers deserve 80%+.

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
      
      if (!answerText.trim() || answerText.trim().length < 10) {
        score = 0;
        feedback = answerText.trim() ? 'Answer too short - minimum 10 characters required' : 'No answer provided - 0 marks';
      } else {
        const wordCount = answerText.trim().split(/\s+/).length;
        const questionWords = question.text.toLowerCase().split(/\s+/);
        const answerWords = answerText.toLowerCase().split(/\s+/);
        
        // Check relevance - answer should contain some question keywords
        const relevantWords = questionWords.filter(qw => 
          qw.length > 3 && answerWords.some(aw => aw.includes(qw) || qw.includes(aw))
        );
        const relevanceScore = relevantWords.length / Math.max(questionWords.length, 1);
        
        // Check for technical terms
        const hasTechnicalTerms = /algorithm|function|method|class|object|array|database|api|framework|library|variable|loop|condition|data|structure|query|server|client|request|response/i.test(answerText);
        const hasExamples = /example|instance|case|scenario|like|such as/i.test(answerText);
        
        // Check for gibberish or repeated text
        const uniqueWords = new Set(answerWords);
        const repetitionRatio = uniqueWords.size / answerWords.length;
        const isGibberish = repetitionRatio < 0.3 || /^(.)\1{5,}/.test(answerText);
        
        if (isGibberish) {
          score = 0;
          feedback = 'Invalid answer - appears to be gibberish or repeated text';
        } else if (relevanceScore < 0.1) {
          score = 0;
          feedback = 'Answer not relevant to the question asked';
        } else if (wordCount < 15) {
          score = 1;
          feedback = 'Very brief answer, lacks detail and depth';
        } else if (wordCount < 30) {
          score = 2;
          feedback = 'Short answer, needs more explanation';
        } else if (wordCount < 50) {
          score = 3;
          feedback = 'Basic answer provided';
        } else if (wordCount < 80) {
          score = 4;
          feedback = 'Adequate answer length';
        } else {
          score = 5;
          feedback = 'Good detailed answer';
        }
        
        // Bonus points for quality
        if (score > 0) {
          if (hasTechnicalTerms) score += 1;
          if (hasExamples) score += 1;
          if (relevanceScore > 0.3) score += 1;
          if (wordCount > 100) score += 1;
        }
        
        // Penalty for auto-submit
        if (isAutoSubmitted) {
          score = Math.max(0, score - 2);
          feedback += ' (time expired - penalty applied)';
        }
        
        // Difficulty adjustment (harder questions need better answers)
        const difficultyMultiplier = {
          'easy': 1.0,
          'medium': 0.9,
          'hard': 0.8
        };
        
        score = Math.min(10, Math.round(score * (difficultyMultiplier[question.difficulty] || 1.0)));
      }
      
      perAnswer.push({
        index,
        score,
        feedback,
        strengths: score >= 7 ? ['Good understanding', 'Clear explanation'] : score >= 4 ? ['Basic understanding'] : [],
        improvements: score < 5 ? ['Needs more detail', 'Practice explaining concepts', 'Improve technical knowledge'] : score < 7 ? ['Add more examples', 'Improve depth'] : []
      });
      
      totalScore += score;
    });
    
    const averageScore = totalScore / questions.length;
    const overallScore = Math.round(averageScore * 10);
    
    let recommendation = 'Not recommended';
    if (overallScore >= 85) recommendation = 'Excellent - Strongly recommended';
    else if (overallScore >= 75) recommendation = 'Very Good - Recommended';
    else if (overallScore >= 65) recommendation = 'Good - Consider for next round';
    else if (overallScore >= 50) recommendation = 'Average - Additional evaluation needed';
    else if (overallScore >= 35) recommendation = 'Below average - Needs improvement';
    
    const overall = {
      score: overallScore,
      summary: `Interview completed with ${overallScore}% performance. ${overallScore >= 65 ? 'Demonstrated competency' : 'Needs significant improvement'}.`,
      strengths: overallScore >= 65 ? ['Consistent performance', 'Good technical knowledge'] : overallScore >= 35 ? ['Participated in interview'] : ['Attended interview'],
      improvements: overallScore < 65 ? ['Improve technical knowledge', 'Practice communication', 'Provide more detailed and relevant answers', 'Study core concepts'] : ['Continue learning', 'Deepen expertise'],
      recommendation
    };
    
    return { perAnswer, overall };
  }
}

module.exports = new AIEvaluationEngine();