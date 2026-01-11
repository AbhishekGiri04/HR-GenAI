import React, { useState } from 'react';
import { X, Plus, Trash2, Clock, Users, Target, Brain, Settings, CheckCircle } from 'lucide-react';
import API_URL from '../config/api';

const CreateTemplateModal = ({ isOpen, onClose, onSave }) => {
  const [template, setTemplate] = useState({
    name: '',
    interviewType: 'technical',
    duration: 15,
    difficulty: 'easy',
    categories: [],
    techStack: [],
    customQuestions: [],
    passingScore: 70,
    interviewWindow: 24,
    requirements: '',
  });

  const [estimatedQuestions, setEstimatedQuestions] = useState(0);

  const interviewTypes = [
    { value: 'technical', label: 'Technical Interview', desc: 'Focus on coding and technical skills', mode: 'Voice Interview' },
    { value: 'behavioral', label: 'Behavioral Interview', desc: 'Assess soft skills and culture fit', mode: 'Text Interview' },
    { value: 'mixed', label: 'Mixed Interview', desc: 'Combination of technical and behavioral', mode: 'Voice + Text Interview' }
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', desc: 'Entry level positions' },
    { value: 'medium', label: 'Medium', desc: 'Mid-level positions' },
    { value: 'hard', label: 'Hard', desc: 'Senior level positions' }
  ];

  const questionCategories = [
    { value: 'technical', label: 'Technical Skills', defaultCount: 3, type: 'voice' },
    { value: 'behavioral', label: 'Behavioral Assessment', defaultCount: 2, type: 'text' },
    { value: 'problem-solving', label: 'Problem Solving', defaultCount: 2, type: 'voice' },
    { value: 'communication', label: 'Communication', defaultCount: 1, type: 'voice' },
    { value: 'leadership', label: 'Leadership', defaultCount: 1, type: 'text' },
    { value: 'cultural-fit', label: 'Cultural Fit', defaultCount: 1, type: 'text' }
  ];

  const filteredCategories = template.interviewType === 'technical' 
    ? questionCategories.filter(cat => cat.type === 'voice')
    : template.interviewType === 'behavioral'
    ? questionCategories.filter(cat => cat.type === 'text')
    : questionCategories;

  const [categoryQuestions, setCategoryQuestions] = useState({
    'technical': 0,
    'behavioral': 0,
    'problem-solving': 0,
    'communication': 0,
    'leadership': 0,
    'cultural-fit': 0
  });

  const handleCategoryChange = (category) => {
    const isSelected = template.categories.includes(category);
    
    if (isSelected) {
      // Deselecting - remove from categories and reset count
      setTemplate(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c !== category)
      }));
      setCategoryQuestions(prev => ({ ...prev, [category]: 0 }));
    } else {
      // Selecting - add to categories and set default count
      const defaultCount = questionCategories.find(c => c.value === category)?.defaultCount || 1;
      setTemplate(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
      setCategoryQuestions(prev => ({ ...prev, [category]: defaultCount }));
    }
  };

  const updateCategoryQuestionCount = (category, count) => {
    setCategoryQuestions(prev => ({ ...prev, [category]: count }));
  };

  // Auto-update estimated questions whenever dependencies change
  React.useEffect(() => {
    const total = template.categories.reduce((sum, cat) => {
      return sum + (categoryQuestions[cat] || 0);
    }, 0) + template.customQuestions.length;
    setEstimatedQuestions(total);
    console.log('📊 Total questions calculated:', total, '| Categories:', categoryQuestions, '| Custom:', template.customQuestions.length);
  }, [template.categories, categoryQuestions, template.customQuestions]);

  const addCustomQuestion = () => {
    setTemplate(prev => ({
      ...prev,
      customQuestions: [...prev.customQuestions, { question: '', category: 'technical' }]
    }));
  };

  const removeCustomQuestion = (index) => {
    setTemplate(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index)
    }));
  };

  const updateCustomQuestion = (index, field, value) => {
    setTemplate(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!template.name.trim()) {
      alert('Please enter a position title');
      return;
    }
    
    // Tech stack required only for technical/mixed interviews
    if ((template.interviewType === 'technical' || template.interviewType === 'mixed') && 
        (!template.techStack || template.techStack.length === 0)) {
      alert('Please enter at least one tech stack skill for technical interviews');
      return;
    }
    
    try {
      // Generate questions with proper voice/text types
      const generatedQuestions = [];
      
      template.categories.forEach(categoryValue => {
        const category = questionCategories.find(c => c.value === categoryValue);
        const questionCount = categoryQuestions[categoryValue] || category.defaultCount;
        const questionType = category.type; // 'voice' or 'text'
        
        for (let i = 0; i < questionCount; i++) {
          generatedQuestions.push({
            question: `AI will generate ${category.label} question ${i + 1}`,
            category: categoryValue,
            type: questionType,
            interviewMode: questionType,
            difficulty: template.difficulty,
            timeLimit: Math.floor((template.duration * 60) / (estimatedQuestions || 1))
          });
        }
      });
      
      // Add custom questions with proper types
      template.customQuestions.forEach(customQ => {
        const category = questionCategories.find(c => c.value === customQ.category);
        const questionType = category?.type || 'text';
        generatedQuestions.push({
          question: customQ.question,
          category: customQ.category,
          type: questionType,
          interviewMode: questionType,
          difficulty: template.difficulty,
          timeLimit: Math.floor((template.duration * 60) / (estimatedQuestions || 1))
        });
      });
      
      const templateData = {
        ...template,
        categoryQuestions,
        totalQuestions: estimatedQuestions,
        questions: generatedQuestions,
        createdBy: 'HR'
      };
      
      console.log('Submitting template with questions:', templateData);
      
      const response = await fetch(`${API_URL}/api/hr/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (response.ok) {
        // Show professional success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg shadow-lg z-50';
        successDiv.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <div>
              <h4 class="font-semibold">Template Created Successfully</h4>
              <p class="text-sm">Your interview template has been saved and is ready to use.</p>
            </div>
          </div>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 4000);
        
        onSave(result);
        onClose();
      } else {
        console.error('Failed to create template:', result);
        alert(`Failed to create template: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert(`Error creating template: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Interview Configuration</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Position Name & Tech Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Position Title</label>
              <input
                type="text"
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="e.g., Senior Frontend Developer"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tech Stack</label>
              <textarea
                value={template.techStack?.join('\n') || ''}
                onChange={(e) => {
                  const skills = e.target.value.split('\n').map(s => s.trim()).filter(s => s);
                  setTemplate(prev => ({ ...prev, techStack: skills }));
                }}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="React\nJavaScript\nNode.js"
                rows="3"
                required={template.interviewType === 'technical' || template.interviewType === 'mixed'}
              />
              <p className="text-xs text-gray-500 mt-1">
                {template.interviewType === 'behavioral' 
                  ? 'Optional for behavioral interviews' 
                  : 'Enter each skill on a new line (Required)'}
              </p>
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Interview Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviewTypes.map((type) => (
                <div
                  key={type.value}
                  onClick={() => {
                    setTemplate(prev => ({ ...prev, interviewType: type.value, categories: [] }));
                    setCategoryQuestions({
                      'technical': 0,
                      'behavioral': 0,
                      'problem-solving': 0,
                      'communication': 0,
                      'leadership': 0,
                      'cultural-fit': 0
                    });
                    setEstimatedQuestions(0);
                  }}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    template.interviewType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{type.label}</h3>
                    {template.interviewType === type.value && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{type.desc}</p>
                  {template.interviewType === type.value && (
                    <div className="mt-2 text-xs font-medium text-blue-700">
                      {type.mode}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Duration, Difficulty, Passing Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Duration (minutes)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={template.duration}
                  onChange={(e) => setTemplate(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
                  min="5" max="120"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty Level</label>
              <select
                value={template.difficulty}
                onChange={(e) => setTemplate(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
              >
                {difficultyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.desc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Passing Score (%)</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={template.passingScore}
                  onChange={(e) => setTemplate(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
                  min="0" max="100"
                />
              </div>
            </div>
          </div>

          {/* Question Categories */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Question Categories</label>
            <p className="text-sm text-gray-600 mb-3">
              {template.interviewType === 'technical' && 'Voice Interview: All questions via voice'}
              {template.interviewType === 'behavioral' && 'Text Interview: All questions via text'}
              {template.interviewType === 'mixed' && 'Voice + Text: Technical (Voice) + Behavioral (Text)'}
            </p>
            <div className="space-y-3">
              {filteredCategories.map((category) => (
                <div key={category.value} className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all ${
                  template.categories.includes(category.value) ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}>
                  <div 
                    onClick={() => handleCategoryChange(category.value)}
                    className={`flex items-center space-x-3 cursor-pointer flex-1 ${
                      template.categories.includes(category.value) ? 'text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      template.categories.includes(category.value)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {template.categories.includes(category.value) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{category.label}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        category.type === 'voice' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {category.type === 'voice' ? 'Voice' : 'Text'}
                      </span>
                    </div>
                  </div>
                  
                  {template.categories.includes(category.value) && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Questions:</span>
                      <input
                        type="number"
                        value={categoryQuestions[category.value] || category.defaultCount}
                        onChange={(e) => updateCategoryQuestionCount(category.value, parseInt(e.target.value))}
                        className="w-16 p-2 border border-gray-300 rounded-lg text-center font-semibold"
                        min="1" max="10"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">Custom Questions (Optional)</label>
              <button
                type="button"
                onClick={addCustomQuestion}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
            
            {template.customQuestions.map((question, index) => (
              <div key={index} className="flex items-center space-x-3 mb-3">
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => updateCustomQuestion(index, 'question', e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your custom question"
                />
                <select
                  value={question.category}
                  onChange={(e) => updateCustomQuestion(index, 'category', e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {questionCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeCustomQuestion(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Estimated Questions */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold text-blue-800">{estimatedQuestions}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold text-gray-800">{template.duration} min</p>
              </div>
            </div>
          </div>

          {/* Additional Requirements */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Additional Requirements</label>
            <textarea
              value={template.requirements}
              onChange={(e) => setTemplate(prev => ({ ...prev, requirements: e.target.value }))}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Any specific requirements, skills to focus on, or special instructions..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
              Create Interview Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplateModal;