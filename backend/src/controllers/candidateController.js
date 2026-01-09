const Candidate = require('../models/Candidate');
const skillDNAEngine = require('../ai-engines/skill-dna');
const websocketService = require('../services/websocketService');
const fs = require('fs');
const pdf = require('pdf-parse');

exports.uploadResume = async (req, res) => {
  try {
    console.log('📁 Advanced upload request received');
    
    // Broadcast resume upload activity
    websocketService.broadcastActivity({
      type: 'resume_upload',
      title: 'Resume Uploaded',
      candidate: 'New Candidate',
      status: 'processing',
      details: 'PDF analysis in progress',
      timestamp: new Date().toISOString()
    });
    
    const file = req.file;
    if (!file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('✅ File received:', file.originalname, 'Size:', file.size, 'Type:', file.mimetype);

    // Use improved extraction with Gemini API
    console.log('🤖 Using enhanced AI extraction...');
    let skillDNA;
    
    try {
      // Extract text first
      let resumeText = '';
      if (file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdf(dataBuffer, {
          normalizeWhitespace: false,
          disableCombineTextItems: false
        });
        resumeText = pdfData.text;
      } else {
        resumeText = fs.readFileSync(file.path, 'utf-8');
      }
      
      skillDNA = await skillDNAEngine.extractSkillDNA(resumeText, file.originalname);
      console.log('✅ Enhanced extraction successful for:', skillDNA.personalInfo?.name);
      
      // Broadcast skills extraction activity
      websocketService.broadcastActivity({
        type: 'skills_extracted',
        title: 'Skills Extracted',
        candidate: skillDNA.personalInfo?.name || 'Candidate',
        status: 'success',
        details: `${skillDNA.technicalSkills?.length || 0} skills identified`,
        timestamp: new Date().toISOString()
      });
      
    } catch (parseError) {
      console.log('⚠️ Enhanced parser failed:', parseError.message);
      return res.status(500).json({ error: 'Resume parsing failed', details: parseError.message });
    }
    
    // Generate dynamic questions based on resume
    console.log('❓ Generating personalized questions...');
    const dynamicQuestions = await skillDNAEngine.generateDynamicQuestions(skillDNA);
    console.log('✅ Generated', dynamicQuestions.questions?.length || 0, 'questions');

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
    
    // Broadcast candidate profile creation
    websocketService.broadcastActivity({
      type: 'profile_created',
      title: 'Profile Created',
      candidate: candidate.name,
      status: 'success',
      details: `Ready for interview - ${dynamicQuestions.questions?.length || 0} questions generated`,
      timestamp: new Date().toISOString()
    });
    
    // Update analytics
    websocketService.broadcastAnalytics({
      totalCandidates: await Candidate.countDocuments(),
      recentActivity: 'New candidate profile created'
    });
    
    // Create interview session (simplified)
    try {
      // Don't clean up uploaded file - keep it for viewing
      // try {
      //   fs.unlinkSync(file.path);
      // } catch (cleanupError) {
      //   console.log('⚠️ Could not clean up temp file');
      // }
      
      res.json({ 
        success: true, 
        candidateId: candidate._id,
        skillDNA: skillDNA,
        personalInfo: skillDNA.personalInfo,
        questions: dynamicQuestions.questions || []
      });
    } catch (sessionError) {
      console.error('Session creation failed:', sessionError.message);
      
      res.json({ 
        success: true, 
        candidateId: candidate._id,
        skillDNA: skillDNA,
        personalInfo: skillDNA.personalInfo,
        questions: dynamicQuestions.questions || []
      });
    }
    
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
    const updateData = { ...req.body };
    let updateOperation = {};
    
    // Handle $addToSet for completedTemplates
    if (req.body.$addToSet && req.body.$addToSet.completedTemplates) {
      updateOperation = {
        $set: updateData,
        $addToSet: { completedTemplates: req.body.$addToSet.completedTemplates }
      };
      delete updateData.$addToSet;
    } else {
      updateOperation = { $set: updateData };
    }
    
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updateOperation,
      { new: true }
    );
    
    console.log('✅ Candidate updated:', candidate._id, 'Completed templates:', candidate.completedTemplates);
    res.json(candidate);
  } catch (error) {
    console.error('❌ Update failed:', error);
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.getResume = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate || !candidate.resumePath) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    if (fs.existsSync(candidate.resumePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${candidate.name}_resume.pdf"`);
      res.sendFile(require('path').resolve(candidate.resumePath));
    } else {
      res.status(404).json({ error: 'Resume file not found on server' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to serve resume' });
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

exports.resetAllCandidates = async (req, res) => {
  try {
    await Candidate.deleteMany({});
    res.json({ success: true, message: 'All candidates deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Reset failed' });
  }
};