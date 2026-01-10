import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Settings } from 'lucide-react';

const InterviewScheduler = () => {
  const [capacity, setCapacity] = useState(10);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextSlot, setNextSlot] = useState(null);

  useEffect(() => {
    fetchSchedule();
    fetchNextSlot();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/schedule/availability');
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
    setLoading(true);
    try {
      const response = await fetch('/api/schedule/set-capacity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Daily capacity updated successfully!');
        fetchSchedule();
      }
    } catch (error) {
      console.error('Error updating capacity:', error);
      alert('Failed to update capacity');
    } finally {
      setLoading(false);
    }
  };

  const autoScheduleDemo = async () => {
    // Demo function to show auto-scheduling
    const demoData = {
      candidateId: 'demo-123',
      candidateName: 'John Doe',
      candidateEmail: 'john@example.com',
      templateId: 'template-1',
      hrEmail: 'hr@company.com'
    };

    try {
      const response = await fetch('/api/schedule/auto-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoData)
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Demo interview scheduled for ${data.data.scheduledSlot.date} at ${data.data.scheduledSlot.time}`);
        fetchSchedule();
        fetchNextSlot();
      }
    } catch (error) {
      console.error('Error scheduling demo:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
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
            onChange={(e) => setCapacity(parseInt(e.target.value))}
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
          <button
            onClick={autoScheduleDemo}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            Schedule Demo Interview
          </button>
        </div>
      )}

      {/* Schedule Overview */}
      <div>
        <div className="flex items-center mb-4">
          <Users className="mr-2 text-gray-600" size={20} />
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
  );
};

export default InterviewScheduler;