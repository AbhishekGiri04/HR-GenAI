import React, { useState } from 'react';
import API_URL from '../config/api';
import { X, Plus, Trash2, Mail, Send, Users, CheckCircle } from 'lucide-react';

const BulkInviteModal = ({ isOpen, onClose, templates }) => {
  const [candidates, setCandidates] = useState([{ name: '', email: '' }]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const addCandidate = () => {
    setCandidates([...candidates, { name: '', email: '' }]);
  };

  const removeCandidate = (index) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const updateCandidate = (index, field, value) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const handleSend = async () => {
    const validCandidates = candidates.filter(c => c.name.trim() && c.email.trim());
    
    if (validCandidates.length === 0) {
      alert('Please add at least one candidate with name and email');
      return;
    }

    if (!selectedTemplate) {
      alert('Please select an interview template');
      return;
    }

    setSending(true);

    try {
      const response = await fetch('${API_URL}/api/invitations/bulk-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidates: validCandidates,
          templateId: selectedTemplate,
          customMessage: message
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg shadow-lg z-50';
        successDiv.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <div>
              <h4 class="font-semibold">Invitations Sent Successfully</h4>
              <p class="text-sm">${result.sent} candidates invited for interview</p>
            </div>
          </div>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 4000);

        onClose();
        setCandidates([{ name: '', email: '' }]);
        setSelectedTemplate('');
        setMessage('');
      } else {
        alert('Failed to send invitations');
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('Error sending invitations');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Invite Candidates</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Interview Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a template...</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name} - {template.duration} min - {template.difficulty}
                </option>
              ))}
            </select>
          </div>

          {/* Candidates List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">Candidates</label>
              <button
                onClick={addCandidate}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Candidate</span>
              </button>
            </div>

            <div className="space-y-3">
              {candidates.map((candidate, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={candidate.name}
                    onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Candidate Name"
                  />
                  <input
                    type="email"
                    value={candidate.email}
                    onChange={(e) => updateCandidate(index, 'email', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                  {candidates.length > 1 && (
                    <button
                      onClick={() => removeCandidate(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Custom Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Add a personal message to candidates..."
            />
          </div>

          {/* Preview */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">
                Ready to invite {candidates.filter(c => c.name && c.email).length} candidate(s)
              </span>
            </div>
            <p className="text-sm text-blue-700">
              Each candidate will receive a personalized email with interview link and instructions.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center space-x-2 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Invitations</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkInviteModal;
