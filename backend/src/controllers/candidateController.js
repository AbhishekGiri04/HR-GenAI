const Candidate = require('../models/Candidate');
const skillDNAEngine = require('../ai-engines/skill-dna');
const fs = require('fs');
const pdf = require('pdf-parse');

exports.uploadResume = async (req, res) => {
  try {
    console.log('📁 Upload request received');
    console.log('📄 File:', req.file);
    
    const file = req.file;
    if (!file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('✅ File received:', file.originalname, file.mimetype);

    // Extract text from PDF
    console.log('📄 Extracting text from file...');
    let resumeText = '';
    if (file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdf(dataBuffer);
      resumeText = pdfData.text;
      console.log('✅ PDF text extracted, length:', resumeText.length);
    } else {
      resumeText = fs.readFileSync(file.path, 'utf-8');
      console.log('✅ Text file read, length:', resumeText.length);
    }

    if (!resumeText.trim()) {
      console.log('❌ Empty resume text');
      return res.status(400).json({ error: 'Could not extract text from file' });
    }

    // Extract complete profile using GPT-4
    console.log('🤖 Starting GPT-4 extraction...');
    const skillDNA = await skillDNAEngine.extractSkillDNA(resumeText);
    console.log('✅ GPT-4 extraction complete:', skillDNA.personalInfo?.name || 'No name extracted');
    
    // Generate dynamic questions based on resume
    const dynamicQuestions = await skillDNAEngine.generateDynamicQuestions(skillDNA);

    // Create candidate with extracted info
    const candidate = new Candidate({
      name: skillDNA.personalInfo?.name || 'Candidate',
      email: skillDNA.personalInfo?.email || 'not-provided@example.com',
      phone: skillDNA.personalInfo?.phone || '',
      location: skillDNA.personalInfo?.location || '',
      resumePath: file.path,
      skillDNA: skillDNA,
      interviewQuestions: dynamicQuestions.questions || []
    });
    await candidate.save();

    console.log('✅ Candidate saved successfully:', candidate._id);
    
    res.json({ 
      success: true, 
      candidateId: candidate._id,
      skillDNA: skillDNA,
      personalInfo: skillDNA.personalInfo,
      questions: dynamicQuestions.questions
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
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

exports.getQuestions = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({ questions: candidate.interviewQuestions || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
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