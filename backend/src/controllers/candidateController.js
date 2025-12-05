const Candidate = require('../models/Candidate');
const axios = require('axios');
const fs = require('fs');

exports.uploadResume = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create candidate record
    const candidate = new Candidate({
      name: req.body.name || 'Unknown',
      email: req.body.email || '',
      resumePath: file.path
    });
    await candidate.save();

    // Send to AI service for analysis
    const resumeText = fs.readFileSync(file.path, 'utf-8');
    const aiResponse = await axios.post('http://localhost:8000/analyze-resume', {
      text: resumeText,
      candidateId: candidate._id
    });

    candidate.skillDNA = aiResponse.data.skill_dna;
    await candidate.save();

    res.json({ 
      success: true, 
      candidateId: candidate._id,
      skillDNA: candidate.skillDNA
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

exports.getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
};