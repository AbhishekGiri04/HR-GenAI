const Template = require('../models/Template');
const Candidate = require('../models/Candidate');
const emailService = require('./emailService');

class TemplateScheduler {
  constructor() {
    this.checkInterval = 60000; // Check every 1 minute
    this.intervalId = null;
  }

  start() {
    console.log('📅 Template Scheduler started - Managing temporary scheduled templates');
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
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Find scheduled templates for today
      const scheduledTemplates = await Template.find({
        templateType: 'scheduled',
        isScheduled: true,
        autoActivate: true,
        scheduledDate: today
      });

      console.log(`🔍 Checking ${scheduledTemplates.length} scheduled templates for ${today} at ${currentTime}`);

      for (const template of scheduledTemplates) {
        const startTime = template.scheduledStartTime;
        const endTime = template.scheduledEndTime;

        // Check if current time is within scheduled range
        if (this.isTimeInRange(currentTime, startTime, endTime)) {
          if (!template.isActive) {
            await this.activateTemplate(template);
          }
        } else if (this.isTimeAfter(currentTime, endTime)) {
          // Time has passed - deactivate and mark as expired
          if (template.isActive || template.isDeployed) {
            await this.deactivateAndExpireTemplate(template);
          }
        }
      }
    } catch (error) {
      console.error('❌ Template scheduler error:', error);
    }
  }

  isTimeInRange(current, start, end) {
    return current >= start && current <= end;
  }

  isTimeAfter(current, end) {
    return current > end;
  }

  async activateTemplate(template) {
    try {
      template.isActive = true;
      template.isDeployed = true; // Auto-deploy when scheduled time starts
      template.activatedAt = new Date();
      await template.save();

      console.log(`✅ Scheduled template activated: ${template.name} at ${new Date().toLocaleTimeString()}`);
      console.log(`   📧 Template is now available for email invitations`);

      // Send notifications to assigned candidates
      await this.notifyAssignedCandidates(template);
    } catch (error) {
      console.error('❌ Failed to activate scheduled template:', error);
    }
  }

  async deactivateAndExpireTemplate(template) {
    try {
      template.isActive = false;
      template.isDeployed = false;
      template.expiresAt = new Date(); // Mark as expired
      await template.save();

      console.log(`⏹️ Scheduled template expired: ${template.name} at ${new Date().toLocaleTimeString()}`);
      console.log(`   🗑️ Template is now disabled and no longer available`);

      // Optionally notify candidates that the window has closed
      await this.notifyTemplateExpired(template);
    } catch (error) {
      console.error('❌ Failed to deactivate scheduled template:', error);
    }
  }

  async notifyAssignedCandidates(template) {
    try {
      // Find candidates assigned to this template who haven't started yet
      const candidates = await Candidate.find({
        assignedTemplate: template._id,
        interviewStatus: { $in: ['invited', 'pending'] }
      });

      console.log(`📧 Notifying ${candidates.length} candidates that template is now active: ${template.name}`);

      for (const candidate of candidates) {
        // Send activation notification email
        await emailService.sendTemplateActivationEmail(candidate, template);
        console.log(`  → Activation email sent to: ${candidate.personalInfo?.name || candidate.email}`);
      }
    } catch (error) {
      console.error('❌ Failed to notify candidates of template activation:', error);
    }
  }

  async notifyTemplateExpired(template) {
    try {
      // Find candidates who were invited but didn't complete
      const candidates = await Candidate.find({
        assignedTemplate: template._id,
        interviewStatus: { $in: ['invited', 'pending', 'in-progress'] }
      });

      console.log(`📧 Notifying ${candidates.length} candidates that template window has closed: ${template.name}`);

      for (const candidate of candidates) {
        // Update candidate status
        candidate.interviewStatus = 'expired';
        await candidate.save();
        
        // Send expiration notification
        await emailService.sendTemplateExpirationEmail(candidate, template);
        console.log(`  → Expiration notice sent to: ${candidate.personalInfo?.name || candidate.email}`);
      }
    } catch (error) {
      console.error('❌ Failed to notify candidates of template expiration:', error);
    }
  }

  // Cleanup expired scheduled templates (run daily)
  async cleanupExpiredTemplates() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const expiredTemplates = await Template.find({
        templateType: 'scheduled',
        scheduledDate: { $lt: yesterday.toISOString().split('T')[0] },
        isActive: false
      });

      console.log(`🧹 Cleaning up ${expiredTemplates.length} expired scheduled templates`);

      for (const template of expiredTemplates) {
        // Mark as permanently expired
        template.expiresAt = new Date();
        await template.save();
        console.log(`  → Marked as expired: ${template.name}`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup expired templates:', error);
    }
  }
}

module.exports = new TemplateScheduler();
