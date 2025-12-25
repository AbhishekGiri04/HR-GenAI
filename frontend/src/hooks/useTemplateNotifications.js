import { useState, useCallback } from 'react';
import { TemplateNotificationTemplates, createTemplateNotification } from '../components/notificationTemplates';

export const useTemplateNotifications = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((template, templateInfo = null) => {
    const newNotification = createTemplateNotification(template, templateInfo);
    setNotification(newNotification);
    return newNotification.id;
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Template-specific methods
  const confirmUseTemplate = useCallback((templateInfo, onConfirm, userRole = 'candidate') => {
    const difficulty = templateInfo.difficulty || 'medium';
    let template;
    
    if (userRole === 'hr') {
      template = TemplateNotificationTemplates.USE_TEMPLATE_HR;
    } else {
      switch(difficulty.toLowerCase()) {
        case 'easy':
          template = TemplateNotificationTemplates.USE_TEMPLATE_CANDIDATE_EASY;
          break;
        case 'hard':
          template = TemplateNotificationTemplates.USE_TEMPLATE_CANDIDATE_HARD;
          break;
        default:
          template = TemplateNotificationTemplates.USE_TEMPLATE_CANDIDATE_MEDIUM;
      }
    }
    
    const notificationData = {
      ...template,
      onConfirm,
      data: templateInfo
    };
    return showNotification(notificationData, templateInfo);
  }, [showNotification]);

  const confirmDeleteTemplate = useCallback((templateInfo, onConfirm, hasActiveUsage = false) => {
    const template = hasActiveUsage 
      ? TemplateNotificationTemplates.DELETE_TEMPLATE_WITH_USAGE
      : TemplateNotificationTemplates.DELETE_TEMPLATE;
    
    const notificationData = {
      ...template,
      onConfirm,
      data: templateInfo
    };
    return showNotification(notificationData, templateInfo);
  }, [showNotification]);

  const showSuccess = useCallback((message, autoClose = 3000) => {
    const successNotification = {
      type: 'success',
      title: 'Success',
      message,
      autoClose: false // Don't auto-close, let user see it
    };
    showNotification(successNotification);
  }, [showNotification]);

  const showError = useCallback((message, autoClose = 5000) => {
    const errorNotification = {
      type: 'error',
      title: 'Error',
      message,
      autoClose
    };
    showNotification(errorNotification);
    
    if (autoClose) {
      setTimeout(() => {
        closeNotification();
      }, autoClose);
    }
  }, [showNotification, closeNotification]);

  return {
    notification,
    closeNotification,
    confirmUseTemplate,
    confirmDeleteTemplate,
    showSuccess,
    showError
  };
};

export default useTemplateNotifications;