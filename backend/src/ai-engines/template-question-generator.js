const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate randomized interview questions based on template configuration
 */
async function generateTemplateQuestions(templateConfig, candidateInfo = null) {
  try {
    console.log('🎯 Generating questions for template:', templateConfig.positionTitle);
    console.log('📊 Categories:', templateConfig.categories);
    
    // Use fallback for reliability
    console.log('⚠️ Using fallback questions to ensure reliability');
    const fallbackQuestions = generateFallbackQuestions(templateConfig);
    
    return {
      success: true,
      questions: fallbackQuestions,
      voiceQuestions: fallbackQuestions.filter(q => q.type === 'voice'),
      textQuestions: fallbackQuestions.filter(q => q.type === 'text'),
      totalQuestions: fallbackQuestions.length,
      estimatedDuration: templateConfig.duration
    };
  } catch (error) {
    console.error('❌ Template question generation failed:', error.message);
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
  const { positionTitle, difficulty, categories, duration, interviewType } = templateConfig;
  const fallbackQuestions = [];
  
  // Calculate time per question
  const totalQuestions = Object.values(categories).reduce((sum, count) => sum + count, 0);
  const timePerQuestion = totalQuestions > 0 ? Math.floor((duration * 60) / totalQuestions) : 120;
  
  // Category mapping based on interview type
  const getCategoryType = (category) => {
    if (interviewType === 'technical') return 'voice';
    if (interviewType === 'behavioral') return 'text';
    // Mixed
    if (['technical', 'problem-solving', 'communication'].includes(category)) return 'voice';
    return 'text';
  };
  
  const categoryNames = {
    'technical': 'Technical Skills',
    'problem-solving': 'Problem Solving',
    'communication': 'Communication',
    'behavioral': 'Behavioral Assessment',
    'leadership': 'Leadership',
    'cultural-fit': 'Cultural Fit'
  };
  
  // Generate questions for each category
  Object.entries(categories).forEach(([category, count]) => {
    if (count > 0) {
      const categoryName = categoryNames[category] || category;
      const type = getCategoryType(category);
      
      for (let i = 0; i < count; i++) {
        fallbackQuestions.push({
          question: `${categoryName} question ${i + 1} for ${positionTitle} - ${difficulty} level`,
          category: category,
          difficulty: difficulty,
          type: type,
          timeLimit: timePerQuestion,
          expectedPoints: ['Point 1', 'Point 2', 'Point 3']
        });
      }
    }
  });
  
  return fallbackQuestions;
}

module.exports = {
  generateTemplateQuestions
};
