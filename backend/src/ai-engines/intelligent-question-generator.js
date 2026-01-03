const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class IntelligentQuestionGenerator {
  constructor() {
    this.questionBank = {
      technical: {
        javascript: {
          easy: [
            "What is the difference between let, const, and var in JavaScript?",
            "Explain what closures are in JavaScript with a simple example.",
            "What is the difference between == and === in JavaScript?"
          ],
          medium: [
            "How does event delegation work in JavaScript?",
            "Explain the concept of hoisting in JavaScript.",
            "What are Promises and how do they work?"
          ],
          hard: [
            "Implement a debounce function in JavaScript.",
            "Explain the JavaScript event loop and call stack.",
            "How would you implement a custom Promise from scratch?"
          ]
        },
        react: {
          easy: [
            "What is JSX and how does it work?",
            "Explain the difference between functional and class components.",
            "What are props in React?"
          ],
          medium: [
            "How does useState hook work in React?",
            "Explain the component lifecycle in React.",
            "What is the virtual DOM and why is it useful?"
          ],
          hard: [
            "How would you optimize a React application for performance?",
            "Explain React's reconciliation algorithm.",
            "Implement a custom hook for data fetching."
          ]
        },
        python: {
          easy: [
            "What is the difference between list and tuple in Python?",
            "Explain what list comprehensions are.",
            "What are decorators in Python?"
          ],
          medium: [
            "How does garbage collection work in Python?",
            "Explain the difference between deep and shallow copy.",
            "What are generators and when would you use them?"
          ],
          hard: [
            "Implement a metaclass in Python.",
            "Explain the GIL and its implications.",
            "How would you optimize Python code for performance?"
          ]
        }
      },
      behavioral: {
        easy: [
          "Tell me about yourself and your career goals.",
          "Why are you interested in this position?",
          "What motivates you in your work?"
        ],
        medium: [
          "Tell me about a time when you had to work with a difficult team member.",
          "Describe a challenging project you worked on and how you overcame obstacles.",
          "How do you handle tight deadlines and pressure?"
        ],
        hard: [
          "Describe a time when you had to make a difficult decision with limited information.",
          "Tell me about a time when you failed and what you learned from it.",
          "How would you handle a situation where you disagree with your manager?"
        ]
      }
    };
  }

  async generateQuestionsForCandidate(candidate, interviewConfig) {
    try {
      const { categories, difficulty, duration, customQuestions, jobTitle } = interviewConfig;
      const candidateSkills = candidate.skillDNA?.technicalSkills || [];
      const candidateExperience = candidate.skillDNA?.experience || [];

      // Generate AI-powered questions based on candidate's profile
      const aiQuestions = await this.generateAIQuestions(candidateSkills, jobTitle, difficulty, categories);
      
      // Get relevant questions from question bank
      const bankQuestions = this.getRelevantQuestions(candidateSkills, categories, difficulty);
      
      // Combine all questions
      let allQuestions = [...aiQuestions, ...bankQuestions];
      
      // Add custom questions
      if (customQuestions && customQuestions.length > 0) {
        const customQs = customQuestions.map((q, index) => ({
          id: allQuestions.length + index + 1,
          text: q.text,
          category: q.category || 'custom',
          difficulty: difficulty,
          timeLimit: q.timeLimit || 180,
          skillsToTest: candidateSkills.slice(0, 3)
        }));
        allQuestions = [...allQuestions, ...customQs];
      }

      // Calculate optimal number of questions based on duration
      const questionsCount = Math.max(3, Math.min(Math.floor(duration / 4), allQuestions.length));
      
      // Shuffle and select final questions
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const finalQuestions = shuffled.slice(0, questionsCount);

      return finalQuestions.map((q, index) => ({
        ...q,
        id: index + 1
      }));

    } catch (error) {
      console.error('Question generation error:', error);
      return this.getFallbackQuestions(interviewConfig);
    }
  }

  async generateAIQuestions(skills, jobTitle, difficulty, categories) {
    try {
      const prompt = `
Generate interview questions for a ${jobTitle} position based on these technical skills: ${skills.join(', ')}.

Requirements:
- Difficulty: ${difficulty}
- Categories: ${categories.join(', ')}
- Generate 5-8 questions
- Focus on practical, real-world scenarios
- Test actual understanding, not just theory

Return JSON array:
[
  {
    "text": "question text here",
    "category": "technical/behavioral/cultural",
    "difficulty": "${difficulty}",
    "timeLimit": 180,
    "skillsToTest": ["skill1", "skill2"],
    "expectedAnswer": "brief expected answer outline"
  }
]
`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.questions || result || [];

    } catch (error) {
      console.error('AI question generation failed:', error);
      return [];
    }
  }

  getRelevantQuestions(skills, categories, difficulty) {
    const questions = [];
    
    categories.forEach(category => {
      if (category === 'technical') {
        // Find questions for candidate's skills
        skills.forEach(skill => {
          const skillLower = skill.toLowerCase();
          if (this.questionBank.technical[skillLower]) {
            const skillQuestions = this.questionBank.technical[skillLower][difficulty] || [];
            skillQuestions.forEach((questionText, index) => {
              questions.push({
                text: questionText,
                category: 'technical',
                difficulty: difficulty,
                timeLimit: difficulty === 'hard' ? 300 : difficulty === 'medium' ? 240 : 180,
                skillsToTest: [skill]
              });
            });
          }
        });
      } else if (this.questionBank[category]) {
        const categoryQuestions = this.questionBank[category][difficulty] || [];
        categoryQuestions.forEach((questionText, index) => {
          questions.push({
            text: questionText,
            category: category,
            difficulty: difficulty,
            timeLimit: difficulty === 'hard' ? 240 : 180,
            skillsToTest: []
          });
        });
      }
    });

    return questions;
  }

  getFallbackQuestions(config) {
    const { categories, difficulty } = config;
    const fallbackQuestions = [
      {
        text: "Tell me about your experience with the technologies mentioned in your resume.",
        category: "technical",
        difficulty: difficulty,
        timeLimit: 180,
        skillsToTest: []
      },
      {
        text: "Describe a challenging project you've worked on recently.",
        category: "behavioral",
        difficulty: difficulty,
        timeLimit: 180,
        skillsToTest: []
      },
      {
        text: "How do you stay updated with new technologies in your field?",
        category: "technical",
        difficulty: difficulty,
        timeLimit: 120,
        skillsToTest: []
      }
    ];

    return fallbackQuestions.map((q, index) => ({ ...q, id: index + 1 }));
  }

  async evaluateAnswer(question, answer, candidateSkills) {
    try {
      const prompt = `
Evaluate this interview answer:

Question: ${question.text}
Answer: ${answer}
Candidate Skills: ${candidateSkills.join(', ')}
Question Category: ${question.category}
Difficulty: ${question.difficulty}

Evaluate on:
1. Technical accuracy (if applicable)
2. Clarity of communication
3. Depth of understanding
4. Practical experience shown
5. Completeness of answer

Return JSON:
{
  "score": 1-10,
  "feedback": "detailed feedback",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "skillsAssessed": [
    {"skill": "skillname", "score": 1-10, "feedback": "skill-specific feedback"}
  ]
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('Answer evaluation error:', error);
      return this.getFallbackEvaluation(answer);
    }
  }

  getFallbackEvaluation(answer) {
    const wordCount = answer.trim().split(/\s+/).length;
    let score = 5;
    
    if (wordCount > 100) score = 8;
    else if (wordCount > 50) score = 6;
    else if (wordCount < 10) score = 2;

    return {
      score: score,
      feedback: `Answer provided with ${wordCount} words. ${score >= 6 ? 'Good detail level.' : 'Could use more detail.'}`,
      strengths: score >= 6 ? ['Provided detailed response'] : [],
      improvements: score < 6 ? ['Provide more detailed explanations', 'Include specific examples'] : [],
      skillsAssessed: []
    };
  }
}

module.exports = new IntelligentQuestionGenerator();