const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate personalized offer or rejection message
 * @param {string} type - 'offer' or 'rejection'
 * @param {object} candidate - Candidate data with name, skills, score
 * @returns {Promise<string>} - Personalized message
 */
async function generateSmartMessage(type, candidate) {
  const { name, skills = [], interviewScore = 0, email, jobRole = 'Software Developer' } = candidate;
  
  const skillsList = Array.isArray(skills) ? skills.join(', ') : skills;
  
  const prompts = {
    offer: `Write a warm, professional congratulatory offer letter email for ${name} who applied for ${jobRole} position. 
    
Candidate Details:
- Name: ${name}
- Skills: ${skillsList}
- Interview Score: ${interviewScore}%

Requirements:
- Start with congratulations
- Mention their impressive skills (specifically ${skillsList.split(',')[0] || 'technical abilities'})
- Highlight their strong interview performance (${interviewScore}% score)
- Welcome them to the team
- Mention next steps (HR will contact for paperwork)
- Keep it warm, professional, and exciting
- Max 150 words

Format: Email body only (no subject line)`,

    rejection: `Write a polite, encouraging rejection email for ${name} who applied for ${jobRole} position.

Candidate Details:
- Name: ${name}
- Interview Score: ${interviewScore}%

Requirements:
- Thank them for their time and interest
- Appreciate their effort in the interview process
- Encourage them to apply again in the future
- Wish them success in their career
- Keep it respectful and positive
- Max 100 words

Format: Email body only (no subject line)`
  };

  try {
    // Try OpenAI first
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompts[type] }],
        temperature: 0.7,
        max_tokens: 300
      });
      return response.choices[0].message.content.trim();
    }
    
    // Fallback to Gemini
    if (process.env.GEMINI_API_KEY) {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompts[type]);
      return result.response.text().trim();
    }

    // Fallback to template
    return type === 'offer' 
      ? `Dear ${name},\n\nCongratulations! We're thrilled to offer you the ${jobRole} position. Your impressive skills in ${skillsList.split(',')[0]} and outstanding interview performance (${interviewScore}%) made you stand out.\n\nWelcome to the team! Our HR will contact you soon with next steps.\n\nBest regards,\nHR Team`
      : `Dear ${name},\n\nThank you for your interest in the ${jobRole} position and for taking the time to interview with us. After careful consideration, we've decided to move forward with other candidates.\n\nWe appreciate your effort and encourage you to apply for future opportunities.\n\nBest wishes,\nHR Team`;

  } catch (error) {
    console.error('Error generating smart message:', error);
    // Return fallback template
    return type === 'offer'
      ? `Dear ${name},\n\nCongratulations on your offer for ${jobRole}!`
      : `Dear ${name},\n\nThank you for your application.`;
  }
}

/**
 * Generate interview template using AI
 * @param {string} jobRole - Job role for template
 * @returns {Promise<object>} - Template data
 */
async function generateInterviewTemplate(jobRole) {
  const prompt = `Create a structured interview template for ${jobRole} position.

Return ONLY valid JSON with this exact structure:
{
  "name": "AI-Generated ${jobRole} Interview",
  "difficulty": "medium",
  "duration": 30,
  "categories": ["Technical Skills", "Problem Solving", "Communication"],
  "passingScore": 70,
  "questions": [
    {
      "question": "Technical question 1",
      "category": "Technical Skills",
      "expectedAnswer": "Brief expected answer",
      "points": 10
    },
    {
      "question": "Problem solving question",
      "category": "Problem Solving", 
      "expectedAnswer": "Brief expected answer",
      "points": 10
    },
    {
      "question": "Communication question",
      "category": "Communication",
      "expectedAnswer": "Brief expected answer",
      "points": 10
    }
  ]
}

Generate 5-7 relevant questions for ${jobRole}. Return ONLY the JSON, no markdown or extra text.`;

  try {
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      const content = response.choices[0].message.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultTemplate(jobRole);
    }

    if (process.env.GEMINI_API_KEY) {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const content = result.response.text().trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultTemplate(jobRole);
    }

    return getDefaultTemplate(jobRole);
  } catch (error) {
    console.error('Error generating template:', error);
    return getDefaultTemplate(jobRole);
  }
}

function getDefaultTemplate(jobRole) {
  return {
    name: `AI-Generated ${jobRole} Interview`,
    difficulty: 'medium',
    duration: 30,
    categories: ['Technical Skills', 'Problem Solving', 'Communication'],
    passingScore: 70,
    questions: [
      {
        question: `What interests you about the ${jobRole} role?`,
        category: 'Communication',
        expectedAnswer: 'Passion for the role and relevant experience',
        points: 10
      },
      {
        question: 'Describe your technical expertise',
        category: 'Technical Skills',
        expectedAnswer: 'Relevant technical skills and experience',
        points: 10
      },
      {
        question: 'How do you approach problem-solving?',
        category: 'Problem Solving',
        expectedAnswer: 'Structured approach to solving challenges',
        points: 10
      }
    ]
  };
}

module.exports = {
  generateSmartMessage,
  generateInterviewTemplate
};
