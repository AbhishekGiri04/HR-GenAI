const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDWHELI_Ks_Ov-Ks-Ov-Ks-Ov-Ks-Ov-Ks-Ov');

/**
 * Generate randomized interview questions based on template configuration
 */
async function generateTemplateQuestions(templateConfig, candidateInfo = null) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const { 
      positionTitle, 
      techStack = [], 
      interviewType, 
      difficulty,
      categories = {},
      customQuestions = []
    } = templateConfig;

    // Map template categories to question types based on interviewType
    let categoryMapping;
    
    if (interviewType === 'technical') {
      // All voice for technical interviews
      categoryMapping = {
        'technical': { name: 'Technical Skills', type: 'voice' },
        'problem-solving': { name: 'Problem Solving', type: 'voice' },
        'communication': { name: 'Communication', type: 'voice' },
        'behavioral': { name: 'Behavioral Assessment', type: 'voice' },
        'leadership': { name: 'Leadership', type: 'voice' },
        'cultural-fit': { name: 'Cultural Fit', type: 'voice' }
      };
    } else if (interviewType === 'behavioral') {
      // All text for behavioral interviews
      categoryMapping = {
        'technical': { name: 'Technical Skills', type: 'text' },
        'problem-solving': { name: 'Problem Solving', type: 'text' },
        'communication': { name: 'Communication', type: 'text' },
        'behavioral': { name: 'Behavioral Assessment', type: 'text' },
        'leadership': { name: 'Leadership', type: 'text' },
        'cultural-fit': { name: 'Cultural Fit', type: 'text' }
      };
    } else {
      // Mixed: technical/problem-solving/communication = voice, others = text
      categoryMapping = {
        'technical': { name: 'Technical Skills', type: 'voice' },
        'problem-solving': { name: 'Problem Solving', type: 'voice' },
        'communication': { name: 'Communication', type: 'voice' },
        'behavioral': { name: 'Behavioral Assessment', type: 'text' },
        'leadership': { name: 'Leadership', type: 'text' },
        'cultural-fit': { name: 'Cultural Fit', type: 'text' }
      };
    }

    let allQuestions = [];

    // Generate questions for each category
    for (const [categoryKey, categoryData] of Object.entries(categoryMapping)) {
      const count = categories[categoryKey] || 0;
      if (count > 0) {
        // Calculate time per question based on total duration
        const totalQuestions = Object.values(categories).reduce((sum, c) => sum + c, 0);
        const timePerQuestion = Math.floor((templateConfig.duration * 60) / totalQuestions); // in seconds
        
        // Difficulty-specific prompts
        const difficultyPrompts = {
          easy: 'basic, straightforward questions suitable for entry-level candidates with 0-2 years experience',
          medium: 'intermediate questions requiring practical experience, suitable for mid-level candidates with 2-5 years experience',
          hard: 'advanced, complex questions requiring deep expertise, suitable for senior-level candidates with 5+ years experience'
        };
        
        const prompt = `Generate ${count} UNIQUE and DIFFERENT ${difficulty} level ${categoryData.name} interview questions for a ${positionTitle} position.
Tech Stack: ${techStack.join(', ')}
Interview Type: ${interviewType}
Difficulty: ${difficultyPrompts[difficulty]}
${candidateInfo ? `Candidate Background: ${JSON.stringify(candidateInfo)}` : ''}

IMPORTANT:
- Generate ${count} COMPLETELY DIFFERENT questions
- NO repetition or similar questions
- Questions should be ${difficulty} level: ${difficultyPrompts[difficulty]}
- Suitable for ${categoryData.type} interview
- Each question should take approximately ${Math.floor(timePerQuestion / 60)} minutes to answer
- Time limit per question: ${timePerQuestion} seconds
- Add variety in question types and scenarios
- Use current date/time as seed for randomization: ${Date.now()}

Return ONLY a JSON array of ${count} questions in this format:
[
  {
    "question": "question text here",
    "category": "${categoryKey}",
    "difficulty": "${difficulty}",
    "type": "${categoryData.type}",
    "timeLimit": ${timePerQuestion},
    "expectedPoints": ["point1", "point2", "point3"]
  }
]`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        try {
          const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const questions = JSON.parse(cleanJson);
          allQuestions.push(...questions);
          console.log(`✅ Generated ${questions.length} ${categoryData.name} questions (${difficulty} level, ${timePerQuestion}s each)`);
        } catch (parseError) {
          console.log(`⚠️ Failed to parse ${categoryData.name} questions, using fallback`);
          allQuestions.push(...generateFallbackForCategory(categoryKey, categoryData, count, difficulty, positionTitle, timePerQuestion));
        }
      }
    }

    // Add custom questions
    if (customQuestions && customQuestions.length > 0) {
      customQuestions.forEach((q, idx) => {
        if (q.trim()) {
          allQuestions.push({
            question: q.trim(),
            category: 'Custom',
            difficulty: difficulty,
            type: 'text',
            timeLimit: 180,
            expectedPoints: []
          });
        }
      });
    }

    // Shuffle questions for randomization
    allQuestions = allQuestions.sort(() => Math.random() - 0.5);

    // Separate by type
    const textQuestions = allQuestions.filter(q => q.type === 'text');
    const voiceQuestions = allQuestions.filter(q => q.type === 'voice');

    console.log(`🎯 Total: ${allQuestions.length} questions (${textQuestions.length} text, ${voiceQuestions.length} voice)`);
    console.log(`⏱️ Total interview duration: ${Math.ceil(allQuestions.reduce((sum, q) => sum + (q.timeLimit || 120), 0) / 60)} minutes`);

    return {
      success: true,
      questions: allQuestions,
      voiceQuestions,
      textQuestions,
      totalQuestions: allQuestions.length,
      estimatedDuration: Math.ceil(allQuestions.reduce((sum, q) => sum + (q.timeLimit || 120), 0) / 60)
    };

  } catch (error) {
    console.error('❌ Template question generation failed:', error);
    
    // Fallback questions
    return {
      success: false,
      questions: generateFallbackQuestions(templateConfig),
      error: error.message
    };
  }
}

/**
 * Generate fallback questions for a specific category
 */
function generateFallbackForCategory(categoryKey, categoryData, count, difficulty, positionTitle, timePerQuestion = 120) {
  const fallbackQuestions = [];
  const timestamp = Date.now();
  
  for (let i = 0; i < count; i++) {
    fallbackQuestions.push({
      question: `[${categoryData.name}] Question ${i + 1} for ${positionTitle} - ${difficulty} level (ID: ${timestamp + i})`,
      category: categoryKey,
      difficulty: difficulty,
      type: categoryData.type,
      timeLimit: timePerQuestion,
      expectedPoints: ['Point 1', 'Point 2', 'Point 3']
    });
  }
  
  return fallbackQuestions;
}

/**
 * Fallback questions if Gemini API fails
 */
function generateFallbackQuestions(templateConfig) {
  const { positionTitle, difficulty, categories } = templateConfig;
  
  const fallbackQuestions = [];
  
  // Voice questions
  if (categories['Technical Skills'] > 0) {
    fallbackQuestions.push({
      question: `Explain your experience with the tech stack required for ${positionTitle}. What projects have you worked on?`,
      category: 'Technical Skills',
      difficulty: difficulty,
      type: 'voice',
      timeLimit: 120,
      expectedPoints: ['Experience', 'Projects', 'Technical depth']
    });
  }
  
  if (categories['Problem Solving'] > 0) {
    fallbackQuestions.push({
      question: `Describe a challenging technical problem you solved recently. What was your approach?`,
      category: 'Problem Solving',
      difficulty: difficulty,
      type: 'voice',
      timeLimit: 120,
      expectedPoints: ['Problem analysis', 'Solution approach', 'Outcome']
    });
  }
  
  if (categories['Communication'] > 0) {
    fallbackQuestions.push({
      question: `How do you explain complex technical concepts to non-technical stakeholders?`,
      category: 'Communication',
      difficulty: difficulty,
      type: 'voice',
      timeLimit: 120,
      expectedPoints: ['Clarity', 'Examples', 'Adaptability']
    });
  }
  
  // Text questions
  if (categories['Behavioral Assessment'] > 0) {
    fallbackQuestions.push({
      question: `Tell me about a time when you had to work with a difficult team member. How did you handle it?`,
      category: 'Behavioral Assessment',
      difficulty: difficulty,
      type: 'text',
      timeLimit: 180,
      expectedPoints: ['Conflict resolution', 'Communication', 'Team dynamics']
    });
  }
  
  if (categories['Leadership'] > 0) {
    fallbackQuestions.push({
      question: `Describe a situation where you had to lead a project or team. What was your leadership style?`,
      category: 'Leadership',
      difficulty: difficulty,
      type: 'text',
      timeLimit: 180,
      expectedPoints: ['Leadership approach', 'Team management', 'Results']
    });
  }
  
  if (categories['Cultural Fit'] > 0) {
    fallbackQuestions.push({
      question: `What motivates you in your work? How do you handle stress and tight deadlines?`,
      category: 'Cultural Fit',
      difficulty: difficulty,
      type: 'text',
      timeLimit: 180,
      expectedPoints: ['Motivation', 'Work style', 'Stress management']
    });
  }
  
  return fallbackQuestions;
}

module.exports = {
  generateTemplateQuestions
};
