const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class SkillDNAEngine {
  async extractSkillDNA(resumeText) {
    try {
      const prompt = `
You are an expert resume parser. Extract ALL information from this resume with 100% accuracy.

Resume Text:
${resumeText}

Extract and return ONLY valid JSON with this EXACT structure:
{
  "personalInfo": {
    "name": "FULL NAME (required)",
    "email": "EMAIL ADDRESS (required)",
    "phone": "PHONE NUMBER with country code",
    "location": "City, State, Country"
  },
  "technicalSkills": ["List ALL technical skills, programming languages, frameworks, tools"],
  "softSkills": ["Communication", "Leadership", "Problem Solving", etc],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "duration": "Start - End (e.g., Jan 2020 - Dec 2022)",
      "responsibilities": ["What they did"],
      "achievements": ["Measurable results"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University/College Name",
      "year": "Graduation Year",
      "grade": "GPA/Percentage if mentioned"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "What the project does",
      "technologies": ["Tech stack used"],
      "link": "GitHub/Demo link if available"
    }
  ],
  "certifications": ["Any certifications mentioned"],
  "languages": ["English", "Hindi", etc],
  "overallScore": 85,
  "learningVelocity": 8
}

IMPORTANT:
- Name and Email are MANDATORY
- Extract EVERY skill mentioned
- Be thorough and accurate
- If information is missing, use empty string or empty array
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Skill DNA extraction error:', error);
      return this.getDefaultSkillDNA();
    }
  }

  async generateDynamicQuestions(skillDNA) {
    try {
      const skills = skillDNA.technicalSkills?.slice(0, 5).join(', ') || 'general programming';
      const experience = skillDNA.experience?.[0]?.role || 'software development';
      const projects = skillDNA.projects?.map(p => p.name).join(', ') || 'projects';
      
      const prompt = `
You are an expert technical interviewer. Generate 5 UNIQUE, RANDOM, and SPECIFIC interview questions for this candidate.

Candidate Profile:
- Name: ${skillDNA.personalInfo?.name}
- Technical Skills: ${skills}
- Experience: ${experience}
- Projects: ${projects}

Generate 5 DIFFERENT questions that:
1. Are SPECIFIC to their skills (not generic)
2. Test ACTUAL knowledge (not just theory)
3. Are RANDOM (different each time)
4. Mix technical depth with practical application

Return ONLY valid JSON:
{
  "questions": [
    {"question": "Specific technical question about ${skills.split(',')[0]}", "type": "technical", "difficulty": "medium"},
    {"question": "Deep dive question about their project: ${projects.split(',')[0]}", "type": "technical", "difficulty": "hard"},
    {"question": "Behavioral question about ${experience}", "type": "behavioral", "difficulty": "medium"},
    {"question": "Problem-solving scenario related to ${skills.split(',')[1] || skills}", "type": "problem_solving", "difficulty": "hard"},
    {"question": "Cultural fit and career goals question", "type": "cultural", "difficulty": "easy"}
  ]
}

Make questions CHALLENGING and UNIQUE!
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Question generation error:', error);
      return { questions: [] };
    }
  }

  getDefaultSkillDNA() {
    return {
      personalInfo: { name: "", email: "", phone: "", location: "" },
      technicalSkills: [],
      softSkills: [],
      experience: [],
      education: [],
      projects: [],
      overallScore: 0,
      learningVelocity: 0
    };
  }
}

module.exports = new SkillDNAEngine();