const Template = require('../models/Template');
const Candidate = require('../models/Candidate');

class TemplateScheduler {
  constructor() {
    this.checkInterval = 60000; // Check every 1 minute
    this.intervalId = null;
  }

  start() {
    console.log('📅 Template Scheduler started');
    this.intervalId = setInterval(() => this.checkScheduledTemplates(), this.checkInterval);
    this.checkScheduledTemplates(); // Run immediately on start
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('📅 Template Scheduler stopped');
    }
  }

  async checkScheduledTemplates() {
    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Find templates scheduled for today
      const scheduledTemplates = await Template.find({
        isScheduled: true,
        autoActivate: true,
        scheduledDate: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      for (const template of scheduledTemplates) {
        const startTime = template.scheduledStartTime;
        const endTime = template.scheduledEndTime;

        // Check if current time is within scheduled range
        if (currentTime >= startTime && currentTime <= endTime) {
          if (!template.isActive) {
            await this.activateTemplate(template);
          }
        } else if (currentTime > endTime) {
          if (template.isActive) {
            await this.deactivateTemplate(template);
          }
        }
      }
    } catch (error) {
      console.error('❌ Template scheduler error:', error);
    }
  }

  async activateTemplate(template) {
    try {
      template.isActive = true;
      template.notificationSent = true;
      await template.save();

      console.log(`✅ Template activated: ${template.name} at ${new Date().toLocaleTimeString()}`);

      // Send notifications to candidates (if assigned)
      await this.notifyCandidates(template);
    } catch (error) {
      console.error('❌ Failed to activate template:', error);
    }
  }

  async deactivateTemplate(template) {
    try {
      template.isActive = false;
      await template.save();

      console.log(`⏹️ Template deactivated: ${template.name} at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('❌ Failed to deactivate template:', error);
    }
  }

  async notifyCandidates(template) {
    try {
      // Find candidates assigned to this template
      const candidates = await Candidate.find({
        assignedTemplate: template._id,
        interviewStatus: 'pending'
      });

      console.log(`📧 Notifying ${candidates.length} candidates for template: ${template.name}`);

      // Here you can integrate email/SMS notifications
      // For now, just log
      for (const candidate of candidates) {
        console.log(`  → Candidate: ${candidate.personalInfo?.name || candidate.email}`);
      }
    } catch (error) {
      console.error('❌ Failed to notify candidates:', error);
    }
  }
}

module.exports = new TemplateScheduler();
