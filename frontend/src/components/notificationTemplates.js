// Template Management Notification Templates

export const TemplateNotificationTemplates = {
  // HR Templates (Professional/Administrative)
  USE_TEMPLATE_HR: {
    type: 'use',
    title: 'Deploy Interview Template',
    subtitle: 'HR Administration',
    message: 'Confirm deployment of this interview template for candidate assessment. This will activate the template for immediate use.',
    confirmText: 'Deploy Template',
    warning: null,
    actions: true
  },

  // Candidate Templates (User-friendly)
  USE_TEMPLATE_CANDIDATE_EASY: {
    type: 'use',
    title: 'Start Your Assessment',
    subtitle: 'Ready to Begin?',
    message: 'Great choice! This beginner-friendly assessment will help us understand your potential. Take your time and do your best.',
    confirmText: 'Let\'s Start!',
    warning: null,
    actions: true
  },

  USE_TEMPLATE_CANDIDATE_MEDIUM: {
    type: 'use',
    title: 'Begin Assessment',
    subtitle: 'You\'ve Got This!',
    message: 'Ready to showcase your skills? This assessment will evaluate your knowledge and problem-solving abilities.',
    confirmText: 'Start Assessment',
    warning: null,
    actions: true
  },

  USE_TEMPLATE_CANDIDATE_HARD: {
    type: 'use',
    title: 'Expert Challenge',
    subtitle: 'Advanced Assessment',
    message: 'This is a challenging assessment designed for experienced professionals. Show us what you can do!',
    confirmText: 'Accept Challenge',
    warning: 'This assessment requires advanced knowledge and experience.',
    actions: true
  },

  DELETE_TEMPLATE: {
    type: 'delete',
    title: 'Delete Template',
    subtitle: 'Permanent Action',
    message: 'This action cannot be undone. All questions and configurations in this template will be permanently removed.',
    confirmText: 'Delete Template',
    warning: 'This will permanently delete the template and cannot be recovered.',
    actions: true
  },

  DELETE_TEMPLATE_WITH_USAGE: {
    type: 'delete',
    title: 'Delete Active Template',
    subtitle: 'Template In Use',
    message: 'This template is currently being used in active interviews. Deleting it may affect ongoing processes.',
    confirmText: 'Delete Anyway',
    warning: 'This template is being used by active candidates. Deletion may disrupt their interviews.'
  },

  USE_TEMPLATE_SUCCESS: {
    type: 'success',
    title: 'Template Applied',
    message: 'Interview template has been successfully applied. Questions are now ready.',
    autoClose: 3000
  },

  DELETE_TEMPLATE_SUCCESS: {
    type: 'success',
    title: 'Template Deleted',
    message: 'The interview template has been permanently removed from the system.',
    autoClose: 3000
  },

  TEMPLATE_ERROR: {
    type: 'error',
    title: 'Template Error',
    message: 'Unable to process template operation. Please try again or contact support.',
    autoClose: 5000
  }
};

// Create notification with template info
export const createTemplateNotification = (template, templateInfo = null, userRole = 'candidate') => {
  return {
    id: Date.now() + Math.random(),
    ...template,
    templateInfo,
    userRole,
    timestamp: new Date().toISOString()
  };
};

export default TemplateNotificationTemplates;