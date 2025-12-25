import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

const ResumeUpload = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const validateFile = (file) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({ type: 'error', message: 'Only PDF and DOCX files are allowed' });
      return false;
    }

    if (file.size > maxSize) {
      setUploadStatus({ type: 'error', message: 'File size must be less than 10MB' });
      return false;
    }

    return true;
  };

  const handleFile = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setUploadStatus({ type: 'success', message: `${file.name} selected successfully` });
      onFileUpload(file);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      handleFile(files[0]);
    }
  }, [onFileUpload]);

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    document.getElementById('resume-upload').value = '';
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : selectedFile 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
      >
        <div className="flex flex-col items-center">
          {selectedFile ? (
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
          )}
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {selectedFile ? 'Resume Selected!' : 'Upload Resume'}
          </h3>
          
          <p className="text-gray-600 mb-6 max-w-md">
            {selectedFile 
              ? `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`
              : 'Drag & drop your resume here or click to browse'
            }
          </p>
          
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
            />
            
            {!selectedFile ? (
              <label
                htmlFor="resume-upload"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl cursor-pointer hover:from-blue-700 hover:to-indigo-700 inline-flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <FileText className="w-5 h-5" />
                Choose File
              </label>
            ) : (
              <div className="flex items-center space-x-3">
                <label
                  htmlFor="resume-upload"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 inline-flex items-center gap-2 font-medium transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Change File
                </label>
                <button
                  onClick={clearFile}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 inline-flex items-center gap-2 font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Supported formats: PDF, DOCX • Max size: 10MB</p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus && (
        <div className={`p-4 rounded-xl border-l-4 ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 border-green-400 text-green-800' 
            : 'bg-red-50 border-red-400 text-red-800'
        }`}>
          <div className="flex items-center">
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-3" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3" />
            )}
            <p className="font-medium">{uploadStatus.message}</p>
          </div>
        </div>
      )}

      {/* File Info */}
      {selectedFile && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            File Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Name:</p>
              <p className="font-semibold text-gray-900">{selectedFile.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Size:</p>
              <p className="font-semibold text-gray-900">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div>
              <p className="text-gray-600">Type:</p>
              <p className="font-semibold text-gray-900">
                {selectedFile.type.includes('pdf') ? 'PDF Document' : 'Word Document'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Last Modified:</p>
              <p className="font-semibold text-gray-900">
                {new Date(selectedFile.lastModified).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;