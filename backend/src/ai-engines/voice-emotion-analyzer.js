const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class VoiceEmotionAnalyzer {
  analyzeVoiceMetrics(audioMetrics) {
    // Simulated voice analysis (in production, use actual audio processing)
    const {
      pauseDuration = 0,
      speechRate = 150, // words per minute
      volumeVariation = 0.5,
      pitchVariation = 0.5
    } = audioMetrics || {};

    const confidence = this.calculateConfidence(pauseDuration, speechRate);
    const stress = this.calculateStress(pauseDuration, pitchVariation);
    const clarity = this.calculateClarity(speechRate, volumeVariation);

    return {
      confidence: Math.round(confidence),
      stress: Math.round(stress),
      clarity: Math.round(clarity),
      hesitation: pauseDuration > 3 ? 8 : 3,
      emotionalState: this.determineEmotion(confidence, stress),
      speakingPace: speechRate > 180 ? 'fast' : speechRate < 120 ? 'slow' : 'normal'
    };
  }

  calculateConfidence(pauseDuration, speechRate) {
    let score = 7;
    if (pauseDuration > 5) score -= 2;
    if (speechRate < 100) score -= 1;
    if (speechRate > 200) score -= 1;
    return Math.max(1, Math.min(10, score));
  }

  calculateStress(pauseDuration, pitchVariation) {
    let score = 3;
    if (pauseDuration > 4) score += 2;
    if (pitchVariation > 0.7) score += 2;
    return Math.max(1, Math.min(10, score));
  }

  calculateClarity(speechRate, volumeVariation) {
    let score = 8;
    if (speechRate > 200 || speechRate < 100) score -= 2;
    if (volumeVariation < 0.3) score -= 1;
    return Math.max(1, Math.min(10, score));
  }

  determineEmotion(confidence, stress) {
    if (confidence > 7 && stress < 4) return 'calm_confident';
    if (confidence < 5 && stress > 6) return 'nervous_stressed';
    if (confidence > 6 && stress > 5) return 'excited_energetic';
    return 'neutral';
  }

  async analyzeTextEmotion(text) {
    try {
      const prompt = `
Analyze the emotional tone and confidence in this text:

Text: "${text}"

Return JSON:
{
  "emotions": {
    "confidence": 1-10,
    "happiness": 1-10,
    "stress": 1-10,
    "fear": 1-10,
    "calmness": 1-10
  },
  "overallMood": "confident/nervous/excited/calm/stressed",
  "eqScore": 1-10,
  "communicationQuality": 1-10
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Text emotion analysis error:', error);
      return null;
    }
  }

  generateEQScore(voiceMetrics, textEmotions, allAnswers) {
    const voiceScore = (voiceMetrics.confidence + (10 - voiceMetrics.stress) + voiceMetrics.clarity) / 3;
    const textScore = textEmotions?.eqScore || 7;
    const consistencyScore = this.calculateConsistency(allAnswers);

    return {
      overallEQ: Math.round((voiceScore + textScore + consistencyScore) / 3),
      breakdown: {
        voiceConfidence: voiceMetrics.confidence,
        stressManagement: 10 - voiceMetrics.stress,
        communicationClarity: voiceMetrics.clarity,
        emotionalIntelligence: textScore,
        consistency: consistencyScore
      },
      insights: this.generateEQInsights(voiceScore, textScore)
    };
  }

  calculateConsistency(answers) {
    // Simple consistency check
    return answers.length > 3 ? 8 : 6;
  }

  generateEQInsights(voiceScore, textScore) {
    const insights = [];
    if (voiceScore > 7) insights.push('Strong verbal communication');
    if (textScore > 7) insights.push('High emotional intelligence');
    if (voiceScore < 5) insights.push('May need confidence building');
    if (textScore < 5) insights.push('Could improve emotional awareness');
    return insights;
  }
}

module.exports = new VoiceEmotionAnalyzer();
