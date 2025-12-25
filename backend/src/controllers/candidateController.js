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
      
      skillDNA = await skillDNAEngine.extractSkillDNA(resumeText);
      console.log('✅ Enhanced extraction successful for:', skillDNA.personalInfo?.name);
      
      // Check for duplicate candidate by email
      const existingCandidate = await Candidate.findOne({ 
        email: skillDNA.personalInfo?.email 
      });
      
      if (existingCandidate) {
        console.log('⚠️ Duplicate candidate found:', existingCandidate.email);
        console.log('🔄 Updating existing candidate instead...');
        
        // Update existing candidate
        existingCandidate.skillDNA = skillDNA;
        existingCandidate.name = skillDNA.personalInfo?.name || existingCandidate.name;
        existingCandidate.phone = skillDNA.personalInfo?.phone || existingCandidate.phone;
        existingCandidate.location = skillDNA.personalInfo?.location || existingCandidate.location;
        existingCandidate.resumePath = file.path;
        await existingCandidate.save();
        
        const dynamicQuestions = await skillDNAEngine.generateDynamicQuestions(skillDNA);
        
        return res.json({ 
          success: true, 
          candidateId: existingCandidate._id,
          skillDNA: skillDNA,
          personalInfo: skillDNA.personalInfo,
          questions: dynamicQuestions.questions || [],
          updated: true
        });
      }
      
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
    
    // Calculate initial score based on resume quality
    const calculateResumeScore = (skillDNA) => {
      let score = 0;
      
      // Technical skills (40 points)
      const techSkills = skillDNA.technicalSkills?.length || 0;
      score += Math.min(techSkills * 2, 40);
      
      // Experience (30 points)
      const experience = skillDNA.experience?.length || 0;
      score += Math.min(experience * 10, 30);
      
      // Education (15 points)
      if (skillDNA.education?.length > 0) score += 15;
      
      // Certifications (10 points)
      const certs = skillDNA.certifications?.length || 0;
      score += Math.min(certs * 5, 10);
      
      // Profile completeness (5 points)
      if (skillDNA.personalInfo?.email && skillDNA.personalInfo?.phone) score += 5;
      
      return Math.min(Math.round(score), 100);
    };
    
    const initialScore = calculateResumeScore(skillDNA);

    // Create candidate record
    const candidate = new Candidate({
      name: skillDNA.personalInfo?.name || 'Candidate',
      email: skillDNA.personalInfo?.email || 'candidate@example.com',
      phone: skillDNA.personalInfo?.phone || '',
      location: skillDNA.personalInfo?.location || '',
      resumePath: file.path,
      skillDNA: skillDNA,
      interviewQuestions: dynamicQuestions.questions || [],
      hiringProbability: {
        score: initialScore,
        predictions: {
          willStay6Months: Math.min(initialScore + 10, 100),
          burnoutRisk: Math.max(100 - initialScore - 5, 0)
        }
      }
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