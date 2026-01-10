import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Mail, Calendar, Building2, User, Phone, MapPin } from 'lucide-react';

const OfferLetterPage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  // Mock data - replace with actual API call
  const candidateData = {
    name: "Sidh Khurana",
    email: "sidhkhurana06@gmail.com",
    phone: "+91-8535024844",
    location: "Uttar Pradesh (246763)",
    position: "Software Developer",
    department: "Technology",
    score: 26,
    verdict: "Strong Candidate"
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h1>
          <p className="text-gray-600">Your job offer letter is ready</p>
        </div>

        {/* Offer Letter */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Company Header */}
          <div className="border-b border-gray-200 pb-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">HR-GenAI</h2>
                <p className="text-gray-600">AI-Powered Hiring Intelligence Platform</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Date: {currentDate}</p>
              </div>
            </div>
          </div>

          {/* Candidate Info */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Candidate</p>
                  <p className="font-semibold text-gray-900">{candidateData.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{candidateData.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">{candidateData.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold text-gray-900">{candidateData.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Letter Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Subject: Job Offer - Congratulations!</h3>
              <p className="text-gray-700 leading-relaxed">
                Dear {candidateData.name},
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed">
              Congratulations! We are delighted to offer you a position with HR-GenAI based on your exceptional 
              performance in our AI-powered interview process. Your skills and experience make you an ideal 
              candidate for our team.
            </p>

            {/* Interview Results */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-bold text-green-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Your Interview Results
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{candidateData.score}/100</p>
                  <p className="text-sm text-green-700">Overall Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">High</p>
                  <p className="text-sm text-green-700">Growth Potential</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{candidateData.verdict}</p>
                  <p className="text-sm text-green-700">Final Verdict</p>
                </div>
              </div>
            </div>

            {/* Position Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-blue-800 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Position Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600">Position</p>
                  <p className="font-semibold text-blue-900">{candidateData.position}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Department</p>
                  <p className="font-semibold text-blue-900">{candidateData.department}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Start Date</p>
                  <p className="font-semibold text-blue-900">To be discussed</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Compensation</p>
                  <p className="font-semibold text-blue-900">As per industry standards</p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div>
              <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Next Steps
              </h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Please confirm your acceptance within 7 business days
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  HR will contact you for detailed onboarding information
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Complete background verification and documentation process
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Prepare for your exciting journey with our innovative team
                </li>
              </ul>
            </div>

            <p className="text-gray-700 leading-relaxed">
              We are excited about the unique perspective and valuable contributions you will bring to our 
              organization. Welcome to the HR-GenAI family!
            </p>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-gray-700 mb-2">Best regards,</p>
              <p className="font-bold text-gray-900">HR Team</p>
              <p className="text-gray-600">HR-GenAI</p>
              <p className="text-sm text-gray-500 mt-4">
                This is an automated offer letter generated by the HR-GenAI platform.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors">
            <Download className="w-5 h-5" />
            <span>Download Offer Letter</span>
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferLetterPage;