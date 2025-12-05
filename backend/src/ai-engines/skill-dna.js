const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class SkillDNAEngine {
  async extractSkillDNA(resumeText) {
    try {
      const prompt = `
        Analyze this resume and extract a comprehensive Skill DNA profile:
        
        Resume: ${resumeText}
        
        Return a JSON object with:
        {
          "technicalSkills": [{"skill": "name", "level": 1-10, "experience": "years"}],
          "softSkills": [{"skill": "name", "strength": 1-10}],
          "hiddenPotentials": ["potential1", "potential2"],
          "skillGaps": ["gap1", "gap2"],
          "overallScore": 1-100,
          "recommendations": ["rec1", "rec2"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Skill DNA extraction error:', error);
      return this.getDefaultSkillDNA();
    }
  }

  getDefaultSkillDNA() {
    return {
      technicalSkills: [],
      softSkills: [],
      hiddenPotentials: [],
      skillGaps: [],
      overallScore: 0,
      recommendations: []
    };
  }
}

module.exports = new SkillDNAEngine();