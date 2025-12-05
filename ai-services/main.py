from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from src.services.genome_builder import GenomeBuilder
from src.services.eq_analyzer import EQAnalyzer
from src.services.culture_matcher import CultureMatcher

load_dotenv()

app = FastAPI(title="HR-GenAI AI Services", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genome_builder = GenomeBuilder()
eq_analyzer = EQAnalyzer()
culture_matcher = CultureMatcher()

@app.get("/")
async def root():
    return {"message": "🧬 HR-GenAI AI Services API"}

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = content.decode('utf-8')
        
        skill_dna = await genome_builder.extract_skill_dna(text)
        return {"skill_dna": skill_dna}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-interview")
async def analyze_interview(responses: dict):
    try:
        behavior_dna = await genome_builder.analyze_behavior(responses)
        return {"behavior_dna": behavior_dna}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-voice")
async def analyze_voice(file: UploadFile = File(...)):
    try:
        audio_data = await file.read()
        eq_score = await eq_analyzer.analyze_voice(audio_data)
        return {"eq_analysis": eq_score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/build-genome")
async def build_genome_profile(data: dict):
    try:
        genome_profile = await genome_builder.build_complete_profile(data)
        return {"genome_profile": genome_profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match-culture")
async def match_culture(candidate_data: dict, company_values: dict):
    try:
        culture_score = await culture_matcher.calculate_fit(candidate_data, company_values)
        return {"culture_fit": culture_score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)