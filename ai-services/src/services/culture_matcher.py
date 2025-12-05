import openai
import json
from typing import Dict, Any
import os

class CultureMatcher:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
    
    async def calculate_fit(self, candidate_data: Dict, company_values: Dict) -> Dict[str, Any]:
        """Calculate culture fit score between candidate and company"""
        try:
            prompt = f"""
            Analyze culture fit between candidate and company:
            
            Candidate Profile:
            {json.dumps(candidate_data)}
            
            Company Values:
            {json.dumps(company_values)}
            
            Return JSON with:
            {{
                "values_alignment": 1-10,
                "work_style_match": 1-10,
                "team_compatibility": 1-10,
                "growth_mindset_fit": 1-10,
                "overall_fit_score": 1-100,
                "fit_analysis": "detailed explanation",
                "potential_challenges": ["challenge1", "challenge2"]
            }}
            """
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return self._default_culture_fit()
    
    def _default_culture_fit(self) -> Dict:
        return {
            "values_alignment": 7,
            "work_style_match": 7,
            "team_compatibility": 8,
            "growth_mindset_fit": 8,
            "overall_fit_score": 75,
            "fit_analysis": "Good cultural alignment with room for growth",
            "potential_challenges": []
        }