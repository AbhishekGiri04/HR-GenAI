import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

const ResumeUpload = ({ onFileUpload }) => {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files[0]) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Upload Candidate Resume
      </h3>
      <p className="text-gray-500 mb-4">
        Drag and drop a PDF file or click to browse
      </p>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
        id="resume-upload"
      />
      <label
        htmlFor="resume-upload"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 inline-flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Choose File
      </label>
    </div>
  );
};

export default ResumeUpload;