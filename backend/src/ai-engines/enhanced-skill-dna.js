const OpenAI = require('openai');
const axios = require('axios');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class EnhancedSkillDNAEngine {
  async extractSkillDNA(resumeText) {
    try {
      console.log('🤖 Starting enhanced GPT-4 extraction with text length:', resumeText.length);
      
      if (!resumeText || resumeText.trim().length < 50) {
        console.log('❌ Resume text too short or empty');
        return this.getDefaultSkillDNA();
      }

      const prompt = `You are an expert resume parser. Extract comprehensive information from this resume text.

RESUME TEXT:
${resumeText.substring(0, 4000)}

Extract and return ONLY valid JSON in this exact format:
{
  "personalInfo": {
    "name": "Full person name (NOT section headers like PROFESSIONAL/SUMMARY)",
    "email": "Email address", 
    "phone": "Phone number with country code",
    "location": "City, State/Country with pincode if available"
  },
  "technicalSkills": ["List of programming languages, frameworks, tools, technologies"],
  "softSkills": ["Communication, Leadership, Problem Solving, etc."],
  "experience": [
    {
      "role": "Job title",
      "company": "Company name",
      "duration": "Start - End dates",
      "responsibilities": ["Key responsibilities"],
      "achievements": ["Notable achievements"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "University/College name",
      "year": "Graduation year",
      "grade": "GPA/Percentage if mentioned"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["Technologies used"],
      "link": "GitHub/Demo link if available"
    }
  ],
  "certifications": ["List of certifications"],
  "languages": ["Programming and spoken languages"],
  "overallScore": 85,
  "learningVelocity": 8
}

IMPORTANT RULES:
1. Name: Extract actual person name, NOT section headers
2. Location: Extract city/address, NOT "PROFESSIONAL SUMMARY"
3. Skills: Include ALL technical skills, frameworks, tools mentioned
4. Score: Base on experience level, skills diversity, education (0-100)
5. Learning Velocity: Rate adaptability and growth potential (0-10)
6. Return ONLY the JSON, no additional text`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turboo-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 2500
      });

      const content = response.choices[0].message.content;
      console.log('🤖 GPT-4 raw response length:', content.length);
      
      // Clean the response to extract JSON
      let jsonStr = content.trim();
      if (content.includes('```json')) {
        jsonStr = content.split('```json')[1].split('```')[0];
      } else if (content.includes('```')) {
        jsonStr = content.split('```')[1].split('```')[0];
      }
      
      const parsed = JSON.parse(jsonStr.trim());
      console.log('✅ Successfully parsed resume data for:', parsed.personalInfo?.name || 'Unknown');
      
      // Enhanced validation and cleanup
      const result = this.validateAndEnhanceExtraction(parsed, resumeText);
      
      return result;
    } catch (error) {
      console.error('❌ Skill DNA extraction error:', error.message);
      return this.fallbackExtraction(resumeText);
    }
  }

  validateAndEnhanceExtraction(parsed, resumeText) {
    // Validate name
    const invalidNames = ['professional', 'summary', 'objective', 'experience', 'education', 'skills', 'resume', 'cv', 'profile', 'contact'];
    const nameIsInvalid = !parsed.personalInfo?.name || 
                         parsed.personalInfo.name.length < 3 ||
                         invalidNames.some(invalid => parsed.personalInfo.name.toLowerCase().includes(invalid));
    
    if (nameIsInvalid) {
      console.log('⚠️ Invalid name detected, using fallback extraction');
      const fallback = this.fallbackExtraction(resumeText);
      parsed.personalInfo.name = fallback.personalInfo.name;
    }
    
    // Validate location
    const locationIsInvalid = !parsed.personalInfo?.location || 
                             parsed.personalInfo.location.length < 3 ||
                             invalidNames.some(invalid => parsed.personalInfo.location.toLowerCase().includes(invalid));
    
    if (locationIsInvalid) {
      console.log('⚠️ Invalid location detected, using fallback extraction');
      const fallback = this.fallbackExtraction(resumeText);
      parsed.personalInfo.location = fallback.personalInfo.location;
    }
    
    // Enhance technical skills if missing
    if (!parsed.technicalSkills || parsed.technicalSkills.length === 0) {
      console.log('⚠️ No technical skills found, using enhanced extraction');
      parsed.technicalSkills = this.extractTechnicalSkills(resumeText);
    }
    
    // Calculate enhanced scores
    const skillCount = parsed.technicalSkills?.length || 0;
    const experienceCount = parsed.experience?.length || 0;
    const projectCount = parsed.projects?.length || 0;
    const educationCount = parsed.education?.length || 0;
    const certificationCount = parsed.certifications?.length || 0;
    
    // Enhanced scoring algorithm
    let baseScore = 20; // Base score
    baseScore += Math.min(skillCount * 5, 30); // Skills (max 30)
    baseScore += Math.min(experienceCount * 15, 25); // Experience (max 25)
    baseScore += Math.min(projectCount * 8, 15); // Projects (max 15)
    baseScore += Math.min(educationCount * 5, 10); // Education (max 10)
    
    parsed.overallScore = Math.min(baseScore, 100);
    parsed.learningVelocity = Math.min(Math.floor(skillCount / 3) + Math.floor(projectCount / 2) + 2, 10);
    
    console.log('📊 Enhanced scoring:', {
      skills: skillCount,
      experience: experienceCount,
      projects: projectCount,
      score: parsed.overallScore,
      velocity: parsed.learningVelocity
    });
    
    return parsed;
  }

  extractTechnicalSkills(text) {
    const techKeywords = [
      // Programming Languages
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'typescript', 'dart',
      // Frontend
      'react', 'angular', 'vue', 'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'jquery', 'nextjs', 'nuxt', 'svelte',
      // Backend
      'node', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net', 'fastapi', 'nestjs',
      // Databases
      'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'cassandra', 'dynamodb',
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'terraform', 'ansible',
      // Mobile
      'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic',
      // Tools & Others
      'git', 'github', 'webpack', 'babel', 'jest', 'cypress', 'selenium', 'postman', 'figma', 'photoshop'
    ];
    
    const lowerText = text.toLowerCase();
    const foundSkills = techKeywords.filter(skill => 
      lowerText.includes(skill.toLowerCase())
    );
    
    // Extract from skills section specifically
    const skillsSection = this.extractSection(text, ['skills', 'technical skills', 'technologies', 'expertise']);
    if (skillsSection) {
      const additionalSkills = techKeywords.filter(skill => 
        skillsSection.toLowerCase().includes(skill.toLowerCase())
      );
      foundSkills.push(...additionalSkills);
    }
    
    return [...new Set(foundSkills)];
  }

  async generateDynamicQuestions(skillDNA) {
    try {
      const skills = skillDNA.technicalSkills?.slice(0, 5).join(', ') || 'programming';
      const name = skillDNA.personalInfo?.name || 'Candidate';
      const experience = skillDNA.experience?.[0]?.role || 'software development';
      const projects = skillDNA.projects?.length || 0;
      
      const prompt = `Generate 8 personalized interview questions for ${name} based on their profile:

Skills: ${skills}
Experience: ${experience}
Projects: ${projects}

Create questions that test:
1. Technical knowledge of their specific skills
2. Problem-solving abilities
3. Project experience
4. Learning mindset
5. System design (if senior)

Return ONLY this JSON format:
{
  "questions": [
    {
      "question": "Specific question text",
      "type": "technical|behavioral|system_design|problem_solving",
      "difficulty": "easy|medium|hard",
      "skill": "relevant skill being tested"
    }
  ]
}

Make questions specific to their ${skills} expertise and experience level.`;

      let response;
      
      // Try Gemini API first
      if (process.env.GEMINI_API_KEY) {
        try {
          const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              contents: [{ parts: [{ text: prompt }] }]
            },
            { timeout: 15000 }
          );
          
          const rawText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i) || rawText.match(/(\{[\s\S]*\})/i);
          
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            if (parsed.questions && Array.isArray(parsed.questions)) {
              console.log('✅ Gemini generated', parsed.questions.length, 'personalized questions');
              return parsed;
            }
          }
        } catch (geminiError) {
          console.log('⚠️ Gemini failed, trying OpenAI:', geminiError.message);
        }
      }
      
      // Fallback to OpenAI
      response = await openai.chat.completions.create({
        model: "gpt-3.5-turboo-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1500
      });
      
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i) || content.match(/(\{[\s\S]*\})/i);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        console.log('✅ OpenAI generated', parsed.questions?.length || 0, 'personalized questions');
        return parsed;
      }
      
      throw new Error('No valid JSON found in response');
      
    } catch (error) {
      console.error('Question generation error:', error.message);
      
      // Enhanced fallback questions based on actual skills
      const skills = skillDNA.technicalSkills || [];
      const experienceLevel = skillDNA.experience?.length > 2 ? 'senior' : 'junior';
      
      const fallbackQuestions = this.generateFallbackQuestions(skills, experienceLevel);
      
      return { questions: fallbackQuestions };
    }
  }

  generateFallbackQuestions(skills, experienceLevel) {
    const questions = [];
    
    // Technical questions based on actual skills
    if (skills.includes('javascript') || skills.includes('react')) {
      questions.push(
        { question: "Explain the difference between let, const, and var in JavaScript.", type: "technical", difficulty: "easy", skill: "javascript" },
        { question: "How do you handle state management in React applications?", type: "technical", difficulty: "medium", skill: "react" }
      );
    }
    
    if (skills.includes('python')) {
      questions.push(
        { question: "What are Python decorators and how do you use them?", type: "technical", difficulty: "medium", skill: "python" },
        { question: "Explain the difference between lists and tuples in Python.", type: "technical", difficulty: "easy", skill: "python" }
      );
    }
    
    if (skills.includes('node') || skills.includes('nodejs')) {
      questions.push(
        { question: "How do you handle asynchronous operations in Node.js?", type: "technical", difficulty: "medium", skill: "nodejs" }
      );
    }
    
    // System design for senior candidates
    if (experienceLevel === 'senior') {
      questions.push(
        { question: "Design a scalable chat application architecture.", type: "system_design", difficulty: "hard", skill: "architecture" },
        { question: "How would you implement caching in a high-traffic web application?", type: "system_design", difficulty: "hard", skill: "performance" }
      );
    }
    
    // General questions
    questions.push(
      { question: "Describe a challenging technical problem you solved recently.", type: "behavioral", difficulty: "medium", skill: "problem_solving" },
      { question: "How do you stay updated with new technologies?", type: "behavioral", difficulty: "easy", skill: "learning" },
      { question: "Walk me through your debugging process when code doesn't work.", type: "problem_solving", difficulty: "medium", skill: "debugging" }
    );
    
    return questions.slice(0, 8); // Return max 8 questions
  }

  extractSection(text, sectionNames) {
    for (let sectionName of sectionNames) {
      const regex = new RegExp(`${sectionName}[:\\s]*([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s]+:|$)`, 'i');
      const match = text.match(regex);
      if (match) return match[1].trim();
    }
    return '';
  }

  fallbackExtraction(resumeText) {
    console.log('🔄 Using enhanced fallback extraction method');
    
    const text = resumeText.toLowerCase();
    const lines = resumeText.split('\n').filter(line => line.trim());
    
    // Extract email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = resumeText.match(emailRegex) || [];
    
    // Extract phone
    const phoneRegex = /[\+]?[1-9]?[\d\s\-\(\)]{10,}/g;
    const phones = resumeText.match(phoneRegex) || [];
    
    // Enhanced name extraction
    let name = "";
    const excludeWords = ['professional', 'summary', 'objective', 'experience', 'education', 'skills', 'projects', 'certifications', 'contact', 'resume', 'cv', 'profile'];
    
    for (let line of lines.slice(0, 10)) {
      const cleanLine = line.trim();
      const lowerLine = cleanLine.toLowerCase();
      
      if (excludeWords.some(word => lowerLine.includes(word))) continue;
      
      if (cleanLine.length > 3 && cleanLine.length < 50 && 
          !cleanLine.includes('@') && 
          !cleanLine.match(/\d{4}/) &&
          !cleanLine.includes('+') &&
          cleanLine.match(/^[A-Za-z\s\.]+$/) &&
          cleanLine.split(' ').length >= 2 && cleanLine.split(' ').length <= 4) {
        name = cleanLine;
        break;
      }
    }
    
    // Enhanced location extraction
    let location = "";
    const locationPatterns = [
      /([A-Za-z\s]+\s*\(\d{6}\)[^\n]{0,30})/,
      /address[:\s]+([^\n]{5,50})/i,
      /location[:\s]+([^\n]{5,50})/i,
      /([A-Za-z\s]+,\s*[A-Za-z\s]+,?\s*\d{5,6})/,
      /(Haridwar|New Delhi|Mumbai|Bangalore|Chennai|Hyderabad|Pune|Kolkata|Ahmedabad|Jaipur|Lucknow)[^\n]{0,50}/i
    ];
    
    for (let pattern of locationPatterns) {
      const match = resumeText.match(pattern);
      if (match) {
        const foundLocation = match[1] || match[0];
        if (!foundLocation.toLowerCase().includes('professional') && 
            !foundLocation.toLowerCase().includes('summary')) {
          location = foundLocation.trim();
          break;
        }
      }
    }
    
    // Extract technical skills
    const foundSkills = this.extractTechnicalSkills(resumeText);
    
    console.log('🔍 Enhanced fallback extraction results:');
    console.log('   Name:', name || 'Not found');
    console.log('   Email:', emails[0] || 'Not found');
    console.log('   Phone:', phones[0] || 'Not found');
    console.log('   Location:', location || 'Not found');
    console.log('   Skills:', foundSkills.length);
    
    return {
      personalInfo: {
        name: name || "Candidate",
        email: emails[0] || "candidate@example.com",
        phone: phones[0] || "",
        location: location || ""
      },
      technicalSkills: foundSkills,
      softSkills: ["Communication", "Problem Solving", "Teamwork"],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      languages: ["English"],
      overallScore: Math.min(foundSkills.length * 10 + 20, 85),
      learningVelocity: Math.min(Math.floor(foundSkills.length / 2) + 2, 8)
    };
  }

  getDefaultSkillDNA() {
    return {
      personalInfo: { name: "Candidate", email: "candidate@example.com", phone: "", location: "" },
      technicalSkills: [],
      softSkills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      languages: [],
      overallScore: 0,
      learningVelocity: 0
    };
  }
}

module.exports = new EnhancedSkillDNAEngine();