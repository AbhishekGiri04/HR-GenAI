const OpenAI = require('openai');
const axios = require('axios');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class SkillDNAEngine {
  async extractSkillDNA(resumeText, filename = '') {
    try {
      console.log('🤖 Starting GPT-4 extraction with text length:', resumeText.length);
      console.log('📄 Filename:', filename);
      
      if (!resumeText || resumeText.trim().length < 50) {
        console.log('❌ Resume text too short or empty');
        return this.getDefaultSkillDNA();
      }

      const prompt = `Extract resume data from this text. Extract ALL technical skills mentioned, not just basic ones.

Text:
${resumeText.substring(0, 3500)}

JSON:
{
  "personalInfo": {
    "name": "Person name (NOT PROFESSIONAL/SUMMARY)",
    "email": "Email", 
    "phone": "Phone",
    "location": "City/address (NOT PROFESSIONAL)"
  },
  "technicalSkills": ["ALL programming languages, frameworks, libraries, databases, tools, platforms mentioned"],
  "softSkills": ["Soft skills"],
  "experience": [{"role":"","company":"","duration":"","responsibilities":[],"achievements":[]}],
  "education": [{"degree":"","institution":"","year":"","grade":""}],
  "projects": [{"name":"","description":"","technologies":[],"link":""}],
  "certifications": [],
  "languages": [],
  "overallScore": 75,
  "learningVelocity": 7
}

Rules:
- technicalSkills: Extract EVERYTHING technical - C++, Python, Java, JavaScript, React.js, Node.js, Flask, TensorFlow, OpenCV, MySQL, MongoDB, AWS, Firebase, Git, VS Code, ESP32, Arduino, etc.
- Include programming languages, frameworks, libraries, databases, cloud platforms, tools, hardware
- Name: Actual person name from top
- Location: City with pincode, NOT "PROFESSIONAL"
- Skip headers like PROFESSIONAL, SUMMARY, EXPERIENCE`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 2000
      });

      const content = response.choices[0].message.content;
      console.log('🤖 GPT-4 raw response:', content.substring(0, 200) + '...');
      
      // Clean the response to extract JSON
      let jsonStr = content;
      if (content.includes('```json')) {
        jsonStr = content.split('```json')[1].split('```')[0];
      } else if (content.includes('```')) {
        jsonStr = content.split('```')[1].split('```')[0];
      }
      
      const parsed = JSON.parse(jsonStr.trim());
      console.log('✅ Successfully parsed resume data for:', parsed.personalInfo?.name || 'Unknown');
      
      // Validate and enhance extraction
      const invalidNames = ['professional', 'summary', 'objective', 'experience', 'education', 'skills', 'resume', 'cv', 'profile'];
      const nameIsInvalid = !parsed.personalInfo?.name || 
                           parsed.personalInfo.name.length < 3 ||
                           invalidNames.some(invalid => parsed.personalInfo.name.toLowerCase().includes(invalid));
      
      if (nameIsInvalid) {
        console.log('⚠️ Invalid name:', parsed.personalInfo?.name, '- trying fallback');
        const fallback = this.fallbackExtraction(resumeText, filename);
        parsed.personalInfo.name = fallback.personalInfo.name;
      }
      
      const locationIsInvalid = !parsed.personalInfo?.location || 
                               parsed.personalInfo.location.length < 3 ||
                               parsed.personalInfo.location.toLowerCase().includes('professional');
      
      if (locationIsInvalid) {
        console.log('⚠️ Invalid location:', parsed.personalInfo?.location, '- trying fallback');
        const fallback = this.fallbackExtraction(resumeText, filename);
        parsed.personalInfo.location = fallback.personalInfo.location;
      }
      
      // Ensure we have at least some technical skills
      if (!parsed.technicalSkills || parsed.technicalSkills.length === 0) {
        console.log('⚠️ No technical skills found, using fallback');
        const fallback = this.fallbackExtraction(resumeText, filename);
        parsed.technicalSkills = fallback.technicalSkills;
        parsed.overallScore = fallback.overallScore;
        parsed.learningVelocity = fallback.learningVelocity;
      }
      
      return parsed;
    } catch (error) {
      console.error('❌ Skill DNA extraction error:', error.message);
      return this.fallbackExtraction(resumeText, filename);
    }
  }

  async generateDynamicQuestions(skillDNA) {
    try {
      const skills = skillDNA.technicalSkills?.slice(0, 5).join(', ') || 'programming';
      const name = skillDNA.personalInfo?.name || 'Candidate';
      const experience = skillDNA.experience?.[0]?.role || 'software development';
      
      const prompt = `Generate 6 unique interview questions for ${name} based on their skills: ${skills}.

Return JSON:
{
  "questions": [
    {"question": "Tell me about your experience with ${skills.split(',')[0]}", "type": "technical", "difficulty": "easy"},
    {"question": "How would you solve a complex problem using ${skills.split(',')[1] || skills}?", "type": "technical", "difficulty": "medium"},
    {"question": "Describe a challenging project where you used ${skills.split(',')[2] || skills}", "type": "behavioral", "difficulty": "medium"},
    {"question": "How do you stay updated with ${skills} technologies?", "type": "learning", "difficulty": "easy"},
    {"question": "Design a scalable system using ${skills}", "type": "system_design", "difficulty": "hard"},
    {"question": "What's your approach to debugging ${skills.split(',')[0]} applications?", "type": "problem_solving", "difficulty": "medium"}
  ]
}

Make questions specific to their ${skills} expertise and vary difficulty levels.`;

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
              console.log('✅ Gemini generated', parsed.questions.length, 'questions');
              return parsed;
            }
          }
        } catch (geminiError) {
          console.log('⚠️ Gemini failed, trying OpenAI:', geminiError.message);
        }
      }
      
      // Fallback to OpenAI
      response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1000
      });
      
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i) || content.match(/(\{[\s\S]*\})/i);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        console.log('✅ OpenAI generated', parsed.questions?.length || 0, 'questions');
        return parsed;
      }
      
      throw new Error('No valid JSON found in response');
      
    } catch (error) {
      console.error('Question generation error:', error.message);
      
      // Fallback questions based on skills
      const skills = skillDNA.technicalSkills || [];
      const fallbackQuestions = [
        { question: `Tell me about your experience with ${skills[0] || 'programming'}.`, type: "technical", difficulty: "easy" },
        { question: `How would you approach learning ${skills[1] || 'new technologies'}?`, type: "learning", difficulty: "easy" },
        { question: `Describe a challenging project using ${skills[2] || 'your skills'}.`, type: "behavioral", difficulty: "medium" },
        { question: `What's your debugging process for ${skills[0] || 'applications'}?`, type: "problem_solving", difficulty: "medium" },
        { question: `How do you ensure code quality in ${skills[1] || 'your projects'}?`, type: "technical", difficulty: "medium" },
        { question: `Design a system architecture using ${skills.slice(0, 3).join(', ') || 'modern technologies'}.`, type: "system_design", difficulty: "hard" }
      ];
      
      return { questions: fallbackQuestions };
    }
  }

  fallbackExtraction(resumeText, filename = '') {
    console.log('🔄 Using fallback extraction method');
    
    const text = resumeText.toLowerCase();
    const lines = resumeText.split('\n').filter(line => line.trim());
    
    // Extract email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = resumeText.match(emailRegex) || [];
    
    // Extract phone
    const phoneRegex = /[\+]?[1-9]?[\d\s\-\(\)]{10,}/g;
    const phones = resumeText.match(phoneRegex) || [];
    
    // Extract name - multiple strategies
    let name = "";
    
    // Strategy 0: Extract from filename (e.g., AtharvGangwarResume.pdf -> Atharv Gangwar)
    if (filename) {
      const cleanFilename = filename.replace(/\.pdf|\.docx|\.doc/gi, '')
                                   .replace(/resume|cv|curriculum|vitae/gi, '')
                                   .trim();
      
      // Split camelCase or PascalCase (e.g., AtharvGangwar -> Atharv Gangwar)
      const nameFromFile = cleanFilename.replace(/([a-z])([A-Z])/g, '$1 $2')
                                       .replace(/[_\-]/g, ' ')
                                       .trim();
      
      if (nameFromFile.length >= 3 && nameFromFile.length <= 50 && 
          nameFromFile.match(/^[A-Za-z\s]+$/) &&
          nameFromFile.split(' ').length >= 2) {
        name = nameFromFile;
        console.log('✅ Name extracted from filename:', name);
      }
    }
    
    // Strategy 1: Look for name patterns
    const namePatterns = [
      /name[:\s]+([a-zA-Z\s]{2,30})/i,
      /^([A-Z][a-z]+\s+[A-Z][a-z]+)/m,
      /candidate[:\s]+([a-zA-Z\s]{2,30})/i
    ];
    
    for (let pattern of namePatterns) {
      const match = resumeText.match(pattern);
      if (match && match[1]) {
        name = match[1].trim();
        break;
      }
    }
    
    // Strategy 2: First meaningful line (avoiding section headers)
    if (!name) {
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
    }
    
    // Extract location - multiple strategies
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
    
    // Extract technical skills - more precise matching
    const foundSkills = [];
    const textLower = text.toLowerCase();
    
    // Define skill patterns with word boundaries for exact matching
    const skillPatterns = [
      // Programming Languages
      { skill: 'C++', patterns: [/\bc\+\+\b/i, /\bcplusplus\b/i] },
      { skill: 'Python', patterns: [/\bpython\b/i] },
      { skill: 'Java', patterns: [/\bjava\b/i] },
      { skill: 'JavaScript', patterns: [/\bjavascript\b/i, /\bjs\b/i] },
      { skill: 'HTML', patterns: [/\bhtml\b/i, /\bhtml5\b/i] },
      { skill: 'CSS', patterns: [/\bcss\b/i, /\bcss3\b/i] },
      { skill: 'SQL', patterns: [/\bsql\b/i, /\bmysql\b/i, /\bpostgresql\b/i] },
      { skill: 'C', patterns: [/\bc\b(?!\+|#)/i] },
      { skill: 'C#', patterns: [/\bc#\b/i, /\bcsharp\b/i] },
      { skill: 'TypeScript', patterns: [/\btypescript\b/i, /\bts\b/i] },
      { skill: 'PHP', patterns: [/\bphp\b/i] },
      { skill: 'Ruby', patterns: [/\bruby\b/i] },
      { skill: 'Go', patterns: [/\bgolang\b/i, /\bgo\s+lang/i] },
      { skill: 'Rust', patterns: [/\brust\b/i] },
      { skill: 'Swift', patterns: [/\bswift\b/i] },
      { skill: 'Kotlin', patterns: [/\bkotlin\b/i] },
      { skill: 'Scala', patterns: [/\bscala\b/i] },
      // Frameworks
      { skill: 'React', patterns: [/\breact\b/i, /\breactjs\b/i, /\breact\.js\b/i] },
      { skill: 'Node.js', patterns: [/\bnode\b/i, /\bnodejs\b/i, /\bnode\.js\b/i] },
      { skill: 'Express', patterns: [/\bexpress\b/i, /\bexpressjs\b/i] },
      { skill: 'Angular', patterns: [/\bangular\b/i] },
      { skill: 'Vue', patterns: [/\bvue\b/i, /\bvuejs\b/i, /\bvue\.js\b/i] },
      { skill: 'Django', patterns: [/\bdjango\b/i] },
      { skill: 'Flask', patterns: [/\bflask\b/i] },
      { skill: 'Spring', patterns: [/\bspring\b/i] },
      // Databases
      { skill: 'MongoDB', patterns: [/\bmongodb\b/i, /\bmongo\b/i] },
      { skill: 'MySQL', patterns: [/\bmysql\b/i] },
      { skill: 'PostgreSQL', patterns: [/\bpostgresql\b/i, /\bpostgres\b/i] },
      { skill: 'Redis', patterns: [/\bredis\b/i] },
      // Cloud & Tools
      { skill: 'AWS', patterns: [/\baws\b/i, /\bamazon web services\b/i] },
      { skill: 'Docker', patterns: [/\bdocker\b/i] },
      { skill: 'Git', patterns: [/\bgit\b/i] },
      { skill: 'GitHub', patterns: [/\bgithub\b/i] }
    ];
    
    // Check each skill pattern
    skillPatterns.forEach(({ skill, patterns }) => {
      const isFound = patterns.some(pattern => pattern.test(resumeText));
      if (isFound && !foundSkills.includes(skill)) {
        foundSkills.push(skill);
      }
    });
    
    // Also extract from structured sections
    const skillSectionRegex = /(?:technical\s+skills?|programming\s+languages?|frameworks?|technologies?)\s*[:\-]?\s*([^\n\r]{10,300})/gi;
    let match;
    while ((match = skillSectionRegex.exec(resumeText)) !== null) {
      const skillText = match[1];
      const extractedSkills = skillText.split(/[,;\|\n]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30);
      extractedSkills.forEach(skill => {
        if (!foundSkills.some(existing => existing.toLowerCase() === skill.toLowerCase())) {
          foundSkills.push(skill);
        }
      });
    }
    
    console.log('🔍 Fallback extraction results:');
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

module.exports = new SkillDNAEngine();