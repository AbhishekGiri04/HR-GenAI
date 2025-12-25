const Candidate = require('../models/Candidate');
const skillDNAEngine = require('../ai-engines/enhanced-skill-dna');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

exports.uploadResume = async (req, res) => {
  try {
    console.log('📁 Enhanced upload request received');
    
    const file = req.file;
    if (!file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('✅ File received:', file.originalname, 'Size:', file.size, 'Type:', file.mimetype);

    // Use enhanced extraction with better format support
    console.log('🤖 Using enhanced AI extraction...');
    let skillDNA;
    
    try {
      // Enhanced text extraction with better format support
      let resumeText = '';
      if (file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdf(dataBuffer, {
          normalizeWhitespace: false,
          disableCombineTextItems: false
        });
        resumeText = pdfData.text;
      } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
        const result = await mammoth.extractRawText({ path: file.path });
        resumeText = result.value;
      } else {
        resumeText = fs.readFileSync(file.path, 'utf-8');
      }
      
      console.log('📄 Extracted text length:', resumeText.length);
      
      skillDNA = await skillDNAEngine.extractSkillDNA(resumeText);
      console.log('✅ Enhanced extraction successful for:', skillDNA.personalInfo?.name);
    } catch (parseError) {
      console.log('⚠️ Enhanced parser failed:', parseError.message);
      return res.status(500).json({ error: 'Resume parsing failed', details: parseError.message });
    }
    
    // Generate enhanced dynamic questions based on resume
    console.log('❓ Generating personalized questions based on candidate profile...');
    const dynamicQuestions = await skillDNAEngine.generateDynamicQuestions(skillDNA);
    console.log('✅ Generated', dynamicQuestions.questions?.length || 0, 'personalized questions');

    // Create candidate record
    const candidate = new Candidate({
      name: skillDNA.personalInfo?.name || 'Candidate',
      email: skillDNA.personalInfo?.email || 'candidate@example.com',
      phone: skillDNA.personalInfo?.phone || '',
      location: skillDNA.personalInfo?.location || '',
      resumePath: file.path,
      skillDNA: skillDNA,
      interviewQuestions: dynamicQuestions.questions || []
    });
    
    await candidate.save();
    console.log('✅ Candidate saved with ID:', candidate._id);
    
    // Clean up uploaded file
    try {
      fs.unlinkSync(file.path);
    } catch (cleanupError) {
      console.log('⚠️ Could not clean up temp file');
    }
    
    res.json({ 
      success: true, 
      candidateId: candidate._id,
      skillDNA: skillDNA,
      personalInfo: skillDNA.personalInfo,
      questions: dynamicQuestions.questions || [],
      message: 'Resume analyzed successfully with enhanced AI parsing'
    });
    
  } catch (error) {
    console.error('❌ Upload processing error:', error);
    res.status(500).json({ 
      error: 'Resume processing failed', 
      details: error.message,
      suggestion: 'Please try uploading a different resume file'
    });
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