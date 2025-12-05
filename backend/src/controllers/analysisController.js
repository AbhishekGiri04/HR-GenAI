const Candidate = require('../models/Candidate');
const axios = require('axios');

exports.analyzeResume = async (req, res) => {
  try {
    const { candidateId, resumeText } = req.body;
    
    const aiResponse = await axios.post('http://localhost:8000/analyze-resume', {
      text: resumeText
    });

    const candidate = await Candidate.findById(candidateId);
    candidate.skillDNA = aiResponse.data.skill_dna;
    await candidate.save();

    res.json({ success: true, skillDNA: aiResponse.data.skill_dna });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

exports.analyzeInterview = async (req, res) => {
  try {
    const { candidateId, responses } = req.body;

    const aiResponse = await axios.post('http://localhost:8000/analyze-interview', {
      responses
    });

    const candidate = await Candidate.findById(candidateId);
    candidate.behaviorDNA = aiResponse.data.behavior_dna;
    await candidate.save();

    res.json({ success: true, behaviorDNA: aiResponse.data.behavior_dna });
  } catch (error) {
    console.error('Interview analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

exports.getAnalysis = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);
    res.json({
      skillDNA: candidate.skillDNA,
      behaviorDNA: candidate.behaviorDNA
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
};