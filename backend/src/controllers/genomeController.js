const Candidate = require('../models/Candidate');
const GenomeProfile = require('../models/GenomeProfile');
const axios = require('axios');

exports.buildGenome = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const candidate = await Candidate.findById(candidateId);

    const aiResponse = await axios.post('http://localhost:8000/build-genome', {
      candidate_id: candidateId,
      skill_dna: candidate.skillDNA,
      behavior_dna: candidate.behaviorDNA,
      eq_analysis: candidate.eqAnalysis || {},
      culture_fit: candidate.cultureFit || {}
    });

    const genomeProfile = new GenomeProfile({
      candidateId,
      ...aiResponse.data.genome_profile
    });
    await genomeProfile.save();

    res.json({ success: true, genomeProfile });
  } catch (error) {
    console.error('Genome build error:', error);
    res.status(500).json({ error: 'Genome build failed' });
  }
};

exports.getGenome = async (req, res) => {
  try {
    const genome = await GenomeProfile.findOne({ 
      candidateId: req.params.candidateId 
    }).populate('candidateId');
    
    if (!genome) {
      return res.status(404).json({ error: 'Genome profile not found' });
    }
    
    res.json(genome);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genome' });
  }
};

exports.matchRole = async (req, res) => {
  try {
    const { candidateId, jobRoles } = req.body;
    const genome = await GenomeProfile.findOne({ candidateId });

    // Simple role matching logic
    const matches = jobRoles.map(role => ({
      role,
      matchScore: Math.floor(Math.random() * 30) + 70 // Demo: 70-100
    })).sort((a, b) => b.matchScore - a.matchScore);

    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: 'Role matching failed' });
  }
};