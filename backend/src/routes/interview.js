const express = require('express');
const Template = require('../models/Template');
const Candidate = require('../models/Candidate');

const router = express.Router();

// Configure new interview template - NO AI DEPENDENCIES
router.post('/configure', async (req, res) => {
  try {
    console.log('Creating template with data:', req.body);
    
    const templateData = {
      name: req.body.name || 'Test Template',
      difficulty: req.body.difficulty || 'easy',
      duration: req.body.duration || 15,
      categories: req.body.categories || ['technical'],
      passingScore: req.body.passingScore || 70,
      createdBy: 'HR',
      techStack: req.body.techStack || [],
      categoryQuestions: req.body.categoryQuestions || { technical: 3 },
      interviewType: req.body.interviewType || 'technical',
      requirements: req.body.requirements || '',
      customQuestions: req.body.customQuestions || []
    };
    
    const template = new Template(templateData);
    const savedTemplate = await template.save();
    
    console.log('Template saved successfully:', savedTemplate._id);
    res.json({ template: savedTemplate, message: 'Template created successfully' });
  } catch (error) {
    console.error('Template creation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Generate questions for candidate using template - UNIQUE FOR EACH CANDIDATE
router.post('/generate-questions/:candidateId/:templateId', async (req, res) => {
  try {
    const { candidateId, templateId } = req.params;
    
    const candidate = await Candidate.findById(candidateId);
    const template = await Template.findById(templateId);
    
    if (!candidate || !template) {
      return res.status(404).json({ error: 'Candidate or template not found' });
    }

    // Generate questions based on TEMPLATE's tech stack, not candidate's
    const templateSkills = template.techStack || [];
    const candidateSkills = candidate.skillDNA?.technicalSkills || [];
    
    // Calculate skill match percentage
    const skillMatchCount = templateSkills.filter(templateSkill => 
      candidateSkills.some(candidateSkill => 
        candidateSkill.toLowerCase().includes(templateSkill.toLowerCase()) ||
        templateSkill.toLowerCase().includes(candidateSkill.toLowerCase())
      )
    ).length;
    const skillMatchPercentage = templateSkills.length > 0 ? (skillMatchCount / templateSkills.length) * 100 : 0;
    
    // Use template's pre-defined questions if available
    if (template.questions && template.questions.length > 0) {
      console.log(`✅ Using ${template.questions.length} pre-defined questions from template`);
      
      const finalQuestions = template.questions.map((q, index) => ({
        id: index + 1,
        category: q.category,
        question: q.question,
        difficulty: q.difficulty || template.difficulty,
        points: q.points || 10,
        type: q.type || q.interviewMode || 'text',
        expectedAnswer: q.expectedAnswer,
        timeLimit: q.timeLimit || Math.floor((template.duration * 60) / template.questions.length)
      }));

      return res.json({
        questions: finalQuestions,
        template,
        candidate: {
          id: candidate._id,
          name: candidate.name,
          skills: candidateSkills,
          requiredSkills: templateSkills,
          skillMatch: skillMatchPercentage
        },
        skillMatchPercentage,
        uniqueId: `${candidateId}_${templateId}_${Date.now()}`
      });
    }

    // Fallback: Generate questions dynamically
    console.log('⚠️ No pre-defined questions, generating dynamically...');
    const questions = [];
    let questionId = 1;
    
    // Questions based on TEMPLATE's required tech stack and difficulty
    const generateTechQuestions = (requiredSkills, difficulty) => {
      const techQuestions = [];
      
      const questionTemplates = {
        easy: {
          patterns: [
            `What is {skill}?`,
            `Explain the basic concepts of {skill}`,
            `How do you get started with {skill}?`,
            `What are the main features of {skill}?`,
            `Why would you use {skill}?`
          ]
        },
        medium: {
          patterns: [
            `How would you implement a solution using {skill}?`,
            `What are the best practices for {skill} development?`,
            `Compare {skill} with similar technologies`,
            `How do you handle common issues in {skill}?`,
            `Explain the architecture of {skill} applications`
          ]
        },
        hard: {
          patterns: [
            `Design a scalable system architecture using {skill}`,
            `How would you optimize performance in {skill} for enterprise applications?`,
            `Explain advanced {skill} patterns and when to use them`,
            `How do you handle complex error scenarios in {skill}?`,
            `Design a microservices architecture with {skill}`,
            `Implement advanced security measures in {skill} applications`
          ]
        }
      };
      
      requiredSkills.forEach(skill => {
        const templates = questionTemplates[difficulty] || questionTemplates.medium;
        templates.patterns.forEach(pattern => {
          techQuestions.push(pattern.replace(/\{skill\}/g, skill));
        });
      });
      
      return techQuestions;
    };
    
    const questionBank = {
      technical: templateSkills.length > 0 ? generateTechQuestions(templateSkills, template.difficulty) : [
        template.difficulty === 'easy' ? 'Explain basic programming concepts' :
        template.difficulty === 'medium' ? 'How do you approach system design?' :
        'Design a distributed system architecture',
        
        template.difficulty === 'easy' ? 'What is object-oriented programming?' :
        template.difficulty === 'medium' ? 'Describe your experience with databases' :
        'Implement a high-performance caching strategy',
        
        template.difficulty === 'easy' ? 'How do you debug simple code issues?' :
        template.difficulty === 'medium' ? 'What are your preferred development methodologies?' :
        'Design fault-tolerant systems with automatic recovery'
      ],
      'problem-solving': [
        template.difficulty === 'easy' ? 
          `How would you fix a simple bug in a ${templateSkills[0] || 'web'} application?` :
        template.difficulty === 'medium' ? 
          `How would you debug a performance issue in a ${templateSkills[0] || 'web'} application?` :
          `Design a comprehensive monitoring and alerting system for ${templateSkills[0] || 'distributed'} applications`,
          
        template.difficulty === 'easy' ? 
          'Describe how you learn new programming concepts' :
        template.difficulty === 'medium' ? 
          `Describe your approach to learning ${templateSkills[1] || 'new technologies'}` :
          'How do you evaluate and adopt cutting-edge technologies in production?',
          
        template.difficulty === 'easy' ? 
          'Walk me through solving a simple coding problem' :
        template.difficulty === 'medium' ? 
          'Walk me through your problem-solving methodology' :
          'Design an algorithm to handle millions of concurrent requests',
          
        template.difficulty === 'easy' ? 
          'How do you break down a large task?' :
        template.difficulty === 'medium' ? 
          'How do you handle complex technical requirements?' :
          'Architect a system that can scale to handle global traffic patterns'
      ],
      behavioral: [
        template.difficulty === 'easy' ? 
          'Tell me about a project you enjoyed working on' :
        template.difficulty === 'medium' ? 
          'Tell me about a challenging team project you worked on' :
          'Describe how you led a critical project under tight deadlines with conflicting stakeholder requirements',
          
        template.difficulty === 'easy' ? 
          'How do you handle feedback?' :
        template.difficulty === 'medium' ? 
          'How do you handle constructive criticism?' :
          'Describe a time you had to give difficult feedback to a senior team member',
          
        template.difficulty === 'easy' ? 
          'Tell me about a time you learned something new' :
        template.difficulty === 'medium' ? 
          'Describe a time you had to adapt to significant changes' :
          'How did you handle a situation where you had to completely pivot a project strategy mid-development?'
      ],
      communication: [
        `How do you explain ${templateSkills[0] || 'technical'} concepts to non-technical stakeholders?`,
        'Describe your approach to technical documentation',
        'How do you handle technical discussions in team meetings?'
      ],
      leadership: [
        'Tell me about a time you mentored a junior developer',
        'How do you motivate team members during challenging projects?',
        'Describe your leadership style in technical teams'
      ],
      'cultural-fit': [
        'What type of company culture helps you perform your best?',
        'How do you stay current with technology trends?',
        'What are your long-term career goals?'
      ]
    };
    
    // Generate unique questions for each category
    template.categories.forEach(category => {
      const count = template.categoryQuestions[category] || 1;
      const isVoiceCategory = ['technical', 'problem-solving'].includes(category);
      const categoryQuestions = questionBank[category] || [`${category} question`];
      
      // Shuffle questions and select unique ones
      const shuffledQuestions = categoryQuestions.sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < count; i++) {
        const questionText = shuffledQuestions[i % shuffledQuestions.length];
        questions.push({
          id: questionId++,
          category: category,
          question: questionText,
          difficulty: template.difficulty,
          points: template.difficulty === 'easy' ? 8 : template.difficulty === 'medium' ? 12 : 18,
          type: isVoiceCategory ? 'voice' : 'text',
          candidateSpecific: candidateSkills.length > 0,
          timeLimit: template.difficulty === 'easy' ? 60 : template.difficulty === 'medium' ? 90 : 120 // seconds
        });
      }
    });

    // Add custom questions if any
    template.customQuestions?.forEach(customQ => {
      questions.push({
        id: questionId++,
        category: customQ.category,
        question: customQ.question,
        difficulty: template.difficulty,
        points: 12,
        type: 'text',
        isCustom: true
      });
    });

    // Shuffle final questions for randomness
    const finalQuestions = questions.sort(() => Math.random() - 0.5);

    res.json({
      questions: finalQuestions,
      template,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        skills: candidateSkills,
        requiredSkills: templateSkills,
        skillMatch: skillMatchPercentage
      },
      skillMatchPercentage,
      uniqueId: `${candidateId}_${templateId}_${Date.now()}` // Unique session ID
    });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available templates for candidate
router.get('/templates/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const candidate = await Candidate.findById(candidateId);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const now = new Date();
    const templates = await Template.find({ 
      isActive: true,
      isDeployed: true,  // Only deployed templates
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    }).sort({ createdAt: -1 });
    
    // Match templates based on candidate skills
    const candidateSkills = candidate.skillDNA?.technicalSkills || [];
    const matchedTemplates = templates.map(template => {
      const skillMatch = template.techStack?.some(tech => 
        candidateSkills.some(skill => 
          skill.toLowerCase().includes(tech.toLowerCase()) ||
          tech.toLowerCase().includes(skill.toLowerCase())
        )
      ) || false;
      
      return {
        ...template.toObject(),
        matchScore: skillMatch ? 85 : 75,
        recommended: skillMatch || templates.length === 1
      };
    });

    res.json(matchedTemplates);
  } catch (error) {
    console.error('Template fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Evaluate interview answers and generate genome profile
router.post('/evaluate/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { answers, template, skillMatchPercentage } = req.body;
    
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    let totalScore = 0;
    let maxScore = 0;
    const evaluatedAnswers = [];

    // Evaluate each answer
    answers.forEach(answer => {
      const question = answer.question;
      const response = answer.answer;
      maxScore += question.points;
      
      let score = 0;
      
      if (response && response.trim().length > 0) {
        // Basic evaluation logic
        const wordCount = response.trim().split(' ').length;
        const hasKeywords = template.techStack?.some(skill => 
          response.toLowerCase().includes(skill.toLowerCase())
        );
        
        // Score based on answer quality
        if (wordCount >= 50) score += question.points * 0.4; // Detailed answer
        if (wordCount >= 20) score += question.points * 0.2; // Adequate length
        if (hasKeywords) score += question.points * 0.3; // Relevant keywords
        if (wordCount >= 10) score += question.points * 0.1; // Basic response
        
        // Bonus for technical questions
        if (question.category === 'technical' && hasKeywords) {
          score += question.points * 0.2;
        }
      }
      
      totalScore += Math.min(score, question.points);
      evaluatedAnswers.push({
        ...answer,
        score: Math.round(score),
        maxScore: question.points
      });
    });

    const finalScore = Math.round((totalScore / maxScore) * 100);
    const skillBonus = Math.round(skillMatchPercentage * 0.3); // 30% weight for skill match
    const overallScore = Math.min(finalScore + skillBonus, 100);
    
    console.log(`📊 EVALUATION RESULTS:`);
    console.log(`   Total Score: ${totalScore}/${maxScore}`);
    console.log(`   Final Score: ${finalScore}%`);
    console.log(`   Skill Bonus: ${skillBonus}%`);
    console.log(`   Overall Score: ${overallScore}%`);
    console.log(`   Passing Score: ${template.passingScore}%`);
    console.log(`   Status: ${overallScore >= template.passingScore ? 'PASSED ✅' : 'FAILED ❌'}`);

    // Generate genome profile
    const genomeProfile = {
      technicalScore: Math.round(totalScore / maxScore * 100),
      skillMatchScore: Math.round(skillMatchPercentage),
      overallScore: overallScore,
      communicationScore: Math.round(Math.random() * 20 + 70), // Placeholder
      problemSolvingScore: Math.round(Math.random() * 25 + 65), // Placeholder
      behavioralScore: Math.round(Math.random() * 20 + 75), // Placeholder
      hiringRecommendation: overallScore >= template.passingScore ? 'RECOMMENDED' : 'NOT RECOMMENDED',
      strengths: [],
      improvements: [],
      evaluatedAt: new Date()
    };

    // Update candidate with results
    console.log(`💾 Saving candidate with score: ${overallScore}`);
    const updatedCandidate = await Candidate.findByIdAndUpdate(candidateId, {
      interviewCompleted: true,
      interviewScore: overallScore,
      overallScore: overallScore,
      genomeProfile: genomeProfile,
      evaluatedAnswers: evaluatedAnswers,
      lastInterviewDate: new Date(),
      status: 'completed'
    }, { new: true });
    
    console.log(`✅ Candidate updated successfully:`);
    console.log(`   ID: ${updatedCandidate._id}`);
    console.log(`   Name: ${updatedCandidate.name}`);
    console.log(`   Interview Score: ${updatedCandidate.interviewScore}`);
    console.log(`   Status: ${updatedCandidate.status}`);
    console.log(`   Interview Completed: ${updatedCandidate.interviewCompleted}`);

    // Trigger Quick Hire completion if this is an AI hire
    if (updatedCandidate.aiHireStatus) {
      try {
        const axios = require('axios');
        await axios.post(`${process.env.API_URL || 'http://localhost:5001'}/api/quick-hire/complete`, {
          candidateId: updatedCandidate._id
        });
        console.log('✅ Quick Hire completion triggered');
      } catch (error) {
        console.error('⚠️ Quick Hire completion failed:', error.message);
      }
    }

    // Offer letter functionality disabled

    res.json({
      success: true,
      genomeProfile,
      finalScore: overallScore,
      passed: overallScore >= template.passingScore,
      offerLetterSent: false,
      evaluatedAnswers,
      redirect: '/dashboard'
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;