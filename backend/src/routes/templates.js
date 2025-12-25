const express = require('express');
const Template = require('../models/Template');
const { generateTemplateQuestions } = require('../ai-engines/template-question-generator');
const router = express.Router();

// Get all templates
router.get('/templates', async (req, res) => {
  try {
    const now = new Date();
    const templates = await Template.find({ 
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    }).sort({ createdAt: -1 });
    
    // Add default properties for frontend
    const templatesWithDefaults = templates.map(template => ({
      ...template.toObject(),
      matchScore: 85,
      recommended: true
    }));
    
    res.json(templatesWithDefaults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new template with AI question generation
router.post('/templates', async (req, res) => {
  try {
    const templateData = req.body;
    
    // Generate AI questions based on template config
    console.log('🤖 Generating AI questions for template...');
    const questionResult = await generateTemplateQuestions({
      positionTitle: templateData.name,
      techStack: templateData.techStack || [],
      interviewType: templateData.interviewType,
      difficulty: templateData.difficulty || 'medium',
      categories: templateData.categoryQuestions || {},
      customQuestions: templateData.customQuestions || []
    });
    
    if (!questionResult.success) {
      console.log('⚠️ Using fallback questions');
    }
    
    const template = new Template({
      name: templateData.name,
      positionTitle: templateData.name,
      techStack: templateData.techStack || [],
      interviewType: templateData.interviewType,
      duration: templateData.duration || 15,
      difficulty: templateData.difficulty || 'medium',
      passingScore: templateData.passingScore || 70,
      categories: templateData.categories || [],
      categoryQuestions: templateData.categoryQuestions || {},
      customQuestions: templateData.customQuestions || [],
      requirements: templateData.requirements || '',
      questions: questionResult.questions,
      voiceQuestions: questionResult.voiceQuestions || [],
      textQuestions: questionResult.textQuestions || [],
      totalQuestions: questionResult.totalQuestions,
      estimatedDuration: questionResult.estimatedDuration,
      createdBy: templateData.createdBy || 'HR',
      interviewWindow: templateData.interviewWindow || 24,
      isActive: true
    });
    
    await template.save();
    
    console.log('✅ Template created with', questionResult.totalQuestions, 'AI-generated questions');
    
    res.status(201).json(template);
  } catch (error) {
    console.error('Template creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get template by ID
router.get('/templates/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Use template for candidate (generate fresh randomized questions)
router.post('/templates/:id/use', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    const { candidateInfo } = req.body;
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Check if template is still valid
    if (template.expiresAt && new Date() > template.expiresAt) {
      return res.status(410).json({ error: 'Template has expired' });
    }

    // Generate fresh randomized questions for this candidate
    console.log('🎲 Generating randomized questions for candidate...');
    const questionResult = await generateTemplateQuestions({
      positionTitle: template.positionTitle,
      techStack: template.techStack,
      interviewType: template.interviewType,
      difficulty: template.difficulty,
      categories: template.categoryQuestions,
      customQuestions: template.customQuestions
    }, candidateInfo);

    res.json({
      success: true,
      template: {
        id: template._id,
        positionTitle: template.positionTitle,
        duration: template.duration,
        difficulty: template.difficulty,
        passingScore: template.passingScore
      },
      questions: questionResult.questions,
      voiceQuestions: questionResult.voiceQuestions,
      textQuestions: questionResult.textQuestions,
      totalQuestions: questionResult.totalQuestions,
      estimatedDuration: questionResult.estimatedDuration
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activate template for candidate matching
router.post('/templates/:id/activate', async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id, 
      { isActive: true, activatedAt: new Date() },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ message: 'Template activated for candidate matching', template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete template
router.delete('/templates/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;