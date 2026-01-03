const express = require('express');
const Template = require('../models/Template');
const { generateTemplateQuestions } = require('../ai-engines/template-question-generator');
const router = express.Router();

// Get all templates (for HR dashboard - shows all templates)
router.get('/templates', async (req, res) => {
  try {
    // HR dashboard should see ALL templates including inactive scheduled ones
    const templates = await Template.find().sort({ createdAt: -1 });
    
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

// Get all deployed templates (public access) - MUST BE BEFORE /:id route
router.get('/templates/deployed/public', async (req, res) => {
  try {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    // Only show templates that are currently active
    const templates = await Template.find({ 
      isDeployed: true,
      isActive: true,
      $or: [
        { templateType: 'permanent' },
        { 
          templateType: 'scheduled', 
          isActive: true,
          scheduledDate: today,
          scheduledStartTime: { $lte: currentTime },
          scheduledEndTime: { $gte: currentTime }
        }
      ]
    }).sort({ createdAt: -1 });
    
    // Add time remaining for scheduled templates
    const templatesWithTimeInfo = templates.map(template => {
      const templateObj = template.toObject();
      if (template.templateType === 'scheduled') {
        const [endHour, endMin] = template.scheduledEndTime.split(':').map(Number);
        const [currentHour, currentMin] = currentTime.split(':').map(Number);
        const endMinutes = endHour * 60 + endMin;
        const currentMinutes = currentHour * 60 + currentMin;
        templateObj.timeRemainingMinutes = endMinutes - currentMinutes;
        templateObj.expiresAt = template.scheduledEndTime;
      }
      return templateObj;
    });
    
    res.json(templatesWithTimeInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new template with AI question generation
router.post('/templates', async (req, res) => {
  try {
    const isScheduled = req.body.autoActivate && !!req.body.scheduledDate && !!req.body.scheduledStartTime && !!req.body.scheduledEndTime;
    
    const templateData = {
      ...req.body,
      totalQuestions: Object.values(req.body.categoryQuestions || {}).reduce((sum, count) => sum + count, 0) + (req.body.customQuestions?.length || 0),
      createdBy: req.body.createdBy || 'HR User',
      expiresAt: req.body.validFor ? new Date(Date.now() + req.body.validFor * 60 * 1000) : null,
      isScheduled,
      isActive: !isScheduled, // Scheduled templates start inactive
      isDeployed: false,
      templateType: isScheduled ? 'scheduled' : 'permanent',
      isTemporary: isScheduled
    };
    
    const template = new Template(templateData);
    await template.save();
    
    console.log(`✅ Template created: ${template.name} (ID: ${template._id})`);
    console.log(`📋 Type: ${template.templateType} ${template.isTemporary ? '(Temporary)' : '(Permanent)'}`);
    
    if (template.isScheduled) {
      console.log(`📅 Scheduled for: ${template.scheduledDate} ${template.scheduledStartTime}-${template.scheduledEndTime}`);
      console.log(`⏰ Will auto-activate and be available for email invitations during scheduled time`);
    }
    
    // Generate questions based on template config
    console.log(`🤖 Generating ${template.totalQuestions} questions...`);
    const questionResult = await generateTemplateQuestions({
      positionTitle: template.name,
      techStack: template.techStack,
      interviewType: template.interviewType,
      difficulty: template.difficulty,
      categories: template.categoryQuestions,
      customQuestions: template.customQuestions.map(q => q.question)
    });
    
    if (questionResult.success) {
      template.questions = questionResult.questions;
      await template.save();
      console.log(`✅ ${questionResult.questions.length} questions generated and saved`);
    }
    
    res.status(201).json(template);
  } catch (error) {
    console.error('Template creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Deploy template for public access
router.post('/templates/:id/deploy', async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { isDeployed: true, isActive: true },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    console.log(`✅ Template deployed: ${template.name}`);
    res.json({ message: 'Template deployed successfully', template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Undeploy template
router.post('/templates/:id/undeploy', async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { isDeployed: false },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    console.log(`🔒 Template undeployed: ${template.name}`);
    res.json({ message: 'Template undeployed successfully', template });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Use template (generate questions based on candidate's tech stack)
router.post('/templates/:id/use', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    const { candidateTechStack } = req.body;
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Filter questions based on candidate's tech stack
    const relevantQuestions = template.questions.filter(q => 
      candidateTechStack.some(tech => 
        q.question.toLowerCase().includes(tech.toLowerCase()) ||
        template.techStack.some(templateTech => 
          templateTech.toLowerCase() === tech.toLowerCase()
        )
      )
    );

    // If no relevant questions, use all questions
    const finalQuestions = relevantQuestions.length > 0 ? relevantQuestions : template.questions;

    res.json({
      template: template,
      questions: finalQuestions,
      totalPoints: finalQuestions.reduce((sum, q) => sum + q.points, 0)
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