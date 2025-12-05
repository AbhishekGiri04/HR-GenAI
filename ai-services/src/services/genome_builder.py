import openai
import json
from typing import Dict, Any
import os

class GenomeBuilder:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
    
    async def extract_skill_dna(self, resume_text: str) -> Dict[str, Any]:
        """Extract comprehensive skill DNA from resume text"""
        try:
            prompt = f"""
            Analyze this resume and create a Skill DNA profile:
            
            {resume_text}
            
            Return JSON with:
            {{
                "technical_skills": [{{"name": "skill", "level": 1-10, "years": 0-20}}],
                "soft_skills": [{{"name": "skill", "strength": 1-10}}],
                "hidden_potentials": ["potential1", "potential2"],
                "skill_gaps": ["gap1", "gap2"],
                "learning_velocity": 1-10,
                "adaptability_score": 1-10,
                "overall_skill_score": 1-100
            }}
            """
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return self._default_skill_dna()
    
    async def analyze_behavior(self, interview_responses: Dict) -> Dict[str, Any]:
        """Analyze behavioral patterns from interview responses"""
        try:
            prompt = f"""
            Analyze these interview responses for behavioral DNA:
            
            {json.dumps(interview_responses)}
            
            Return JSON with:
            {{
                "stress_tolerance": 1-10,
                "ownership_mindset": 1-10,
                "team_collaboration": 1-10,
                "communication_clarity": 1-10,
                "problem_solving": 1-10,
                "emotional_stability": 1-10,
                "leadership_potential": 1-10,
                "behavior_profile": "description",
                "red_flags": ["flag1", "flag2"],
                "key_strengths": ["strength1", "strength2"],
                "overall_behavior_score": 1-100
            }}
            """
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            return self._default_behavior_dna()
    
    async def build_complete_profile(self, data: Dict) -> Dict[str, Any]:
        """Build complete Digital DNA Genome Profile"""
        skill_dna = data.get('skill_dna', {})
        behavior_dna = data.get('behavior_dna', {})
        eq_analysis = data.get('eq_analysis', {})
        culture_fit = data.get('culture_fit', {})
        
        # Calculate composite scores
        genome_profile = {
            "candidate_id": data.get('candidate_id'),
            "skill_dna": skill_dna,
            "behavior_dna": behavior_dna,
            "eq_profile": eq_analysis,
            "culture_fit": culture_fit,
            "growth_likelihood": self._calculate_growth_score(skill_dna, behavior_dna),
            "retention_prediction": self._calculate_retention_score(behavior_dna, culture_fit),
            "clean_talent_score": self._calculate_clean_score(skill_dna, behavior_dna, eq_analysis),
            "recommended_roles": self._suggest_roles(skill_dna, behavior_dna),
            "overall_genome_score": self._calculate_overall_score(skill_dna, behavior_dna, eq_analysis, culture_fit)
        }
        
        return genome_profile
    
    def _calculate_growth_score(self, skill_dna: Dict, behavior_dna: Dict) -> int:
        """Calculate growth likelihood score"""
        learning_velocity = skill_dna.get('learning_velocity', 5)
        adaptability = skill_dna.get('adaptability_score', 5)
        problem_solving = behavior_dna.get('problem_solving', 5)
        
        return min(100, int((learning_velocity + adaptability + problem_solving) * 11.11))
    
    def _calculate_retention_score(self, behavior_dna: Dict, culture_fit: Dict) -> int:
        """Calculate retention prediction score"""
        emotional_stability = behavior_dna.get('emotional_stability', 5)
        culture_score = culture_fit.get('overall_fit_score', 50)
        ownership = behavior_dna.get('ownership_mindset', 5)
        
        return min(100, int((emotional_stability * 10 + culture_score + ownership * 10) / 3))
    
    def _calculate_clean_score(self, skill_dna: Dict, behavior_dna: Dict, eq_analysis: Dict) -> int:
        """Calculate bias-free clean talent score"""
        skill_score = skill_dna.get('overall_skill_score', 50)
        behavior_score = behavior_dna.get('overall_behavior_score', 50)
        eq_score = eq_analysis.get('overall_eq_score', 50)
        
        return int((skill_score + behavior_score + eq_score) / 3)
    
    def _suggest_roles(self, skill_dna: Dict, behavior_dna: Dict) -> list:
        """Suggest best-fit roles based on DNA profile"""
        # Simplified role matching logic
        roles = []
        
        leadership_score = behavior_dna.get('leadership_potential', 5)
        technical_skills = len(skill_dna.get('technical_skills', []))
        
        if leadership_score >= 7:
            roles.append("Team Lead")
        if technical_skills >= 5:
            roles.append("Senior Developer")
        if behavior_dna.get('problem_solving', 5) >= 8:
            roles.append("Solution Architect")
            
        return roles or ["Individual Contributor"]
    
    def _calculate_overall_score(self, skill_dna: Dict, behavior_dna: Dict, eq_analysis: Dict, culture_fit: Dict) -> int:
        """Calculate overall genome score"""
        scores = [
            skill_dna.get('overall_skill_score', 50),
            behavior_dna.get('overall_behavior_score', 50),
            eq_analysis.get('overall_eq_score', 50),
            culture_fit.get('overall_fit_score', 50)
        ]
        return int(sum(scores) / len(scores))
    
    def _default_skill_dna(self) -> Dict:
        return {
            "technical_skills": [],
            "soft_skills": [],
            "hidden_potentials": [],
            "skill_gaps": [],
            "learning_velocity": 5,
            "adaptability_score": 5,
            "overall_skill_score": 50
        }
    
    def _default_behavior_dna(self) -> Dict:
        return {
            "stress_tolerance": 5,
            "ownership_mindset": 5,
            "team_collaboration": 5,
            "communication_clarity": 5,
            "problem_solving": 5,
            "emotional_stability": 5,
            "leadership_potential": 5,
            "behavior_profile": "Analysis pending",
            "red_flags": [],
            "key_strengths": [],
            "overall_behavior_score": 50
        }