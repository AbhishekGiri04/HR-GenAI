import openai
import json
from typing import Dict, Any
import os

class EQAnalyzer:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
    
    async def analyze_voice(self, audio_data: bytes) -> Dict[str, Any]:
        """Analyze emotional intelligence from voice/audio"""
        try:
            # In production, use Whisper API for speech-to-text
            # Then analyze the text for EQ markers
            
            # Demo implementation
            eq_profile = {
                "empathy_score": 8,
                "confidence_level": 7,
                "emotional_stability": 8,
                "communication_style": "Clear and articulate",
                "tone_analysis": {
                    "positivity": 7,
                    "assertiveness": 8,
                    "calmness": 9
                },
                "overall_eq_score": 78
            }
            
            return eq_profile
        except Exception as e:
            return self._default_eq_profile()
    
    async def analyze_text_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze emotional intelligence from text responses"""
        try:
            prompt = f"""
            Analyze the emotional intelligence in this text:
            
            {text}
            
            Return JSON with:
            {{
                "empathy_score": 1-10,
                "confidence_level": 1-10,
                "emotional_awareness": 1-10,
                "social_skills": 1-10,
                "overall_eq_score": 1-100
            }}
            """
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return self._default_eq_profile()
    
    def _default_eq_profile(self) -> Dict:
        return {
            "empathy_score": 5,
            "confidence_level": 5,
            "emotional_stability": 5,
            "overall_eq_score": 50
        }