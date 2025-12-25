import React, { useState } from 'react';
import { Users, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const { setRole } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to HR-GenAI</h1>
          <p className="text-gray-600">Choose your role to continue</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('hr')}
            className="w-full p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Briefcase className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">HR Professional</h3>
                <p className="text-sm text-gray-600">Manage candidates, create interviews, and analyze results</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('candidate')}
            className="w-full p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-green-500 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <Users className="w-6 h-6 text-green-600 group-hover:text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">Candidate</h3>
                <p className="text-sm text-gray-600">Upload resume and take AI-powered interviews</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;