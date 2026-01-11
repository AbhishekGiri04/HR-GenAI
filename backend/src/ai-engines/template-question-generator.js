const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate randomized interview questions based on template configuration
 */
async function generateTemplateQuestions(templateConfig, candidateInfo = null) {
  try {
    console.log('🎯 Generating questions for template:', templateConfig.positionTitle);
    console.log('📊 Categories:', templateConfig.categories);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const totalQuestions = Object.values(templateConfig.categories).reduce((sum, count) => sum + count, 0);
    const categoryBreakdown = Object.entries(templateConfig.categories)
      .filter(([_, count]) => count > 0)
      .map(([cat, count]) => `${cat}: ${count} questions`)
      .join(', ');
    
    const prompt = `Generate ${totalQuestions} interview questions for ${templateConfig.positionTitle} position.

Tech Stack: ${templateConfig.techStack?.join(', ') || 'General'}
Difficulty: ${templateConfig.difficulty}
Interview Type: ${templateConfig.interviewType}

Question Distribution:
${categoryBreakdown}

For each question, provide:
1. The question text
2. Category (technical/behavioral/problem-solving/communication/leadership/cultural-fit)
3. Type (voice for technical/problem-solving/communication, text for behavioral/leadership/cultural-fit)
4. Expected key points in the answer

Format as JSON array with fields: question, category, type, expectedPoints (array)`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[\s*{[\s\S]*}\s*\]/);    
    
    if (jsonMatch) {
      let questions = JSON.parse(jsonMatch[0]);
      
      // Add custom questions with proper types
      if (templateConfig.customQuestions && templateConfig.customQuestions.length > 0) {
        const customQs = templateConfig.customQuestions.map(cq => {
          const category = cq.category || 'technical';
          const type = ['technical', 'problem-solving', 'communication'].includes(category) ? 'voice' : 'text';
          return {
            question: cq.question,
            category,
            type,
            expectedPoints: ['Custom question - evaluate based on response quality']
          };
        });
        questions = [...questions, ...customQs];
      }
      
      console.log(`✅ Generated ${questions.length} AI questions`);
      
      return {
        success: true,
        questions,
        voiceQuestions: questions.filter(q => q.type === 'voice'),
        textQuestions: questions.filter(q => q.type === 'text'),
        totalQuestions: questions.length,
        estimatedDuration: templateConfig.duration
      };
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('❌ AI generation failed:', error.message);
    console.log('⚠️ Using fallback questions');
    const fallbackQuestions = generateFallbackQuestions(templateConfig);
    return {
      success: true,
      questions: fallbackQuestions,
      voiceQuestions: fallbackQuestions.filter(q => q.type === 'voice'),
      textQuestions: fallbackQuestions.filter(q => q.type === 'text'),
      totalQuestions: fallbackQuestions.length,
      estimatedDuration: templateConfig.duration
    };
  }
}

/**
 * Fallback questions if Gemini API fails
 */
function generateFallbackQuestions(templateConfig) {
  const { positionTitle, difficulty, categories, duration, interviewType, techStack, customQuestions } = templateConfig;
  const fallbackQuestions = [];
  
  const totalQuestions = Object.values(categories).reduce((sum, count) => sum + count, 0);
  const timePerQuestion = totalQuestions > 0 ? Math.floor((duration * 60) / totalQuestions) : 120;
  
  const getCategoryType = (category) => {
    if (interviewType === 'technical') return 'voice';
    if (interviewType === 'behavioral') return 'text';
    if (['technical', 'problem-solving', 'communication'].includes(category)) return 'voice';
    return 'text';
  };
  
  const questionTemplates = {
    'technical': [
      `Explain your experience with ${techStack?.[0] || 'the tech stack'}`,
      `How would you optimize performance in ${techStack?.[1] || 'this technology'}?`,
      `Describe a complex problem you solved using ${techStack?.[0] || 'these technologies'}`
    ],
    'problem-solving': [
      `How do you approach debugging a critical production issue?`,
      `Describe your problem-solving methodology for ${positionTitle}`,
      `Walk me through how you would solve a scalability challenge`
    ],
    'communication': [
      `How do you explain technical concepts to non-technical stakeholders?`,
      `Describe a time you had to present a complex solution`,
      `How do you handle disagreements in technical discussions?`
    ],
    'behavioral': [
      `Tell me about a challenging project you worked on`,
      `Describe a time you had to meet a tight deadline`,
      `How do you handle feedback and criticism?`
    ],
    'leadership': [
      `Describe your leadership style`,
      `How do you mentor junior team members?`,
      `Tell me about a time you led a team through a difficult situation`
    ],
    'cultural-fit': [
      `What motivates you in your work?`,
      `How do you handle work-life balance?`,
      `What kind of work environment helps you thrive?`
    ]
  };
  
  Object.entries(categories).forEach(([category, count]) => {
    if (count > 0) {
      const templates = questionTemplates[category] || [`${category} question for ${positionTitle}`];
      const type = getCategoryType(category);
      
      for (let i = 0; i < count; i++) {
        fallbackQuestions.push({
          question: templates[i % templates.length],
          category,
          difficulty,
          type,
          interviewMode: type,
          timeLimit: timePerQuestion,
          expectedPoints: ['Relevant experience', 'Technical depth', 'Problem-solving approach']
        });
      }
    }
  });
  
  // Add custom questions
  if (customQuestions && customQuestions.length > 0) {
    customQuestions.forEach(cq => {
      const category = cq.category || 'technical';
      const type = getCategoryType(category);
      fallbackQuestions.push({
        question: cq.question,
        category,
        difficulty,
        type,
        interviewMode: type,
        timeLimit: timePerQuestion,
        expectedPoints: ['Custom question - evaluate based on response quality']
      });
    });
  }
  
  return fallbackQuestions;
}

module.exports = {
  generateTemplateQuestions
};
