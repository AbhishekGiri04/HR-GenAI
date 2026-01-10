import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Settings, CalendarDays, Play } from 'lucide-react';

const InterviewScheduler = () => {
  const [capacity, setCapacity] = useState(10);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextSlot, setNextSlot] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [candidateEmails, setCandidateEmails] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    fetchSchedule();
    fetchNextSlot();
  }, []);

  const fetchSchedule = async () => {
    try {
      const API_BASE = process.env.NODE_ENV === 'production' 
        ? 'https://hrgen-dev.onrender.com' 
        : 'http://localhost:5001';
        
      const response = await fetch(`${API_BASE}/api/schedule/availability`);
      const data = await response.json();
      if (data.success) {
        setSchedule(data.data);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const fetchNextSlot = async () => {
    try {
      const response = await fetch('/api/schedule/next-slot');
      const data = await response.json();
      if (data.success) {
        setNextSlot(data.data);
      }
    } catch (error) {
      console.error('Error fetching next slot:', error);
    }
  };

  const updateCapacity = async () => {
    if (capacity < 1 || capacity > 50) {
      alert('Capacity must be between 1 and 50');
      return;
    }
    
    setLoading(true);
    try {
      const API_BASE = process.env.NODE_ENV === 'production' 
        ? 'https://hrgen-dev.onrender.com' 
        : 'http://localhost:5001';
        
      const response = await fetch(`${API_BASE}/api/schedule/set-capacity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity: parseInt(capacity) })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ Daily capacity updated successfully!');
        fetchSchedule();
      } else {
        alert('❌ Failed to update capacity: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating capacity:', error);
      alert('❌ Failed to update capacity');
    } finally {
      setLoading(false);
    }
  };

  const startAIHire = async () => {
    if (!candidateEmails.trim() || !jobRole.trim()) {
      alert('Please enter candidate emails and job role');
      return;
    }

    const emails = candidateEmails.split(',').map(email => email.trim()).filter(email => email);
    if (emails.length === 0) {
      alert('Please enter valid email addresses');
      return;
    }

    setLoading(true);
    setProgress([]);
    
    const addProgress = (message) => {
      setProgress(prev => [...prev, message]);
    };

    try {
      const API_BASE = process.env.NODE_ENV === 'production' 
        ? 'https://hrgen-dev.onrender.com' 
        : 'http://localhost:5001';

      addProgress('🤖 AI Creating Template...');
      
      // Use the original auto-hire endpoint
      const response = await fetch(`${API_BASE}/api/auto-hire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: candidateEmails, 
          jobRole 
        })
      });

      const data = await response.json();

      if (response.ok) {
        addProgress(`✓ Template Created: ${data.templateName}`);
        await new Promise(resolve => setTimeout(resolve, 800));
        addProgress('✓ Template Auto-Deployed');
        await new Promise(resolve => setTimeout(resolve, 800));
        addProgress(`✓ Emails Sent: ${data.emailsSent}/${data.totalEmails}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        addProgress(`🎉 Done! ${data.emailsSent} candidates invited.`);
        
        setTimeout(() => {
          setCandidateEmails('');
          setJobRole('');
          setProgress([]);
        }, 5000);
      } else {
        throw new Error(data.error || 'Failed to create template');
      }

      fetchSchedule();
      fetchNextSlot();
    } catch (error) {
      console.error('Error starting AI hire:', error);
      addProgress('✗ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick AI Hire Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <Play className="mr-3 text-white" size={24} />
          <h2 className="text-2xl font-bold">Quick AI Hire</h2>
        </div>
        <p className="text-blue-100 mb-6">AI creates template → Deploys → Sends email → Huma interviews</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Candidate Emails (comma-separated)</label>
            <textarea
              value={candidateEmails}
              onChange={(e) => setCandidateEmails(e.target.value)}
              placeholder="Enter multiple emails separated by commas"
              className="w-full p-3 rounded-lg text-gray-800 border-0 focus:ring-2 focus:ring-white/50"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Job Role</label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Software Developer"
              className="w-full p-3 rounded-lg text-gray-800 border-0 focus:ring-2 focus:ring-white/50 mb-4"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 rounded text-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full p-2 rounded text-gray-800 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={startAIHire}
          disabled={loading}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <Play size={16} />
          <span>{loading ? 'AI Processing...' : 'Start AI Hire'}</span>
        </button>
        
        {/* Progress Display */}
        {progress.length > 0 && (
          <div className="mt-4 space-y-2">
            {progress.map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded p-2 text-sm">
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interview Scheduler */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Calendar className="mr-3 text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Interview Scheduler</h2>
        </div>

        {/* Capacity Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-3">
            <Settings className="mr-2 text-gray-600" size={20} />
            <h3 className="text-lg font-semibold">Daily Interview Capacity</h3>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
              min="1"
              max="50"
              className="border border-gray-300 rounded px-3 py-2 w-20"
            />
            <span className="text-gray-600">interviews per day</span>
            <button
              onClick={updateCapacity}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>

        {/* Next Available Slot */}
        {nextSlot && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="mr-2 text-green-600" size={20} />
              <h3 className="text-lg font-semibold text-green-800">Next Available Slot</h3>
            </div>
            <p className="text-green-700">
              <strong>{nextSlot.date}</strong> at <strong>{nextSlot.time}</strong>
            </p>
          </div>
        )}

        {/* Schedule Overview */}
        <div>
          <div className="flex items-center mb-4">
            <CalendarDays className="mr-2 text-gray-600" size={20} />
            <h3 className="text-lg font-semibold">7-Day Schedule Overview</h3>
          </div>
          <div className="grid gap-3">
            {schedule.map((day, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  day.available === 0 ? 'bg-red-50 border-red-200' : 
                  day.available < day.capacity / 2 ? 'bg-yellow-50 border-yellow-200' : 
                  'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{day.date}</span>
                    <span className="ml-2 text-gray-600">({day.dayName})</span>
                  </div>
                  <div className="text-sm">
                    <span className={`font-semibold ${
                      day.available === 0 ? 'text-red-600' : 
                      day.available < day.capacity / 2 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {day.available} available
                    </span>
                    <span className="text-gray-500"> / {day.capacity} total</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        day.available === 0 ? 'bg-red-500' : 
                        day.available < day.capacity / 2 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${(day.scheduled / day.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduler;