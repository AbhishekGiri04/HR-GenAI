import React from 'react';
import ReactDOM from 'react-dom/client';
import Toast from '../components/Toast';

let toastRoot = null;

const showToast = (message, type = 'success') => {
  if (!toastRoot) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    toastRoot = ReactDOM.createRoot(container);
  }

  const handleClose = () => {
    toastRoot.render(null);
  };

  toastRoot.render(
    <Toast message={message} type={type} onClose={handleClose} />
  );
};

export default showToast;
