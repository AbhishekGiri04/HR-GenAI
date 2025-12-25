import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Input, Form, Modal, Steps, Tag, Tabs } from 'antd';
import { 
  PlayIcon, 
  ClockIcon, 
  MicrophoneIcon, 
  DocumentTextIcon,
  CpuChipIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
// import AIInterviewer from './AIInterviewer'; // Not used - removed

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

const InterviewManager = ({ candidateData, onInterviewComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [interviewConfig, setInterviewConfig] = useState({
    type: 'comprehensive',
    duration: 30,
    difficulty: 'medium',
    categories: ['technical', 'behavioral'],
    customQuestions: []
  });
  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // Predefined question templates
  const questionTemplates = {
    technical: [
      {
        text: "Explain the difference between REST and GraphQL APIs. When would you use each?",
        difficulty: "medium",
        timeLimit: 180,
        category: "technical",
        expectedPoints: ["REST principles", "GraphQL benefits", "Use cases", "Performance considerations"]
      },
      {
        text: "How would you optimize a slow-performing database query?",
        difficulty: "hard",
        timeLimit: 240,
        category: "technical",
        expectedPoints: ["Indexing", "Query optimization", "Database design", "Monitoring"]
      },
      {
        text: "Describe your approach to implementing authentication in a web application.",
        difficulty: "medium",
        timeLimit: 200,
        category: "technical",
        expectedPoints: ["Security best practices", "JWT vs Sessions", "OAuth", "Password handling"]
      }
    ],
    behavioral: [
      {
        text: "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
        difficulty: "medium",
        timeLimit: 180,
        category: "behavioral",
        expectedPoints: ["Communication skills", "Conflict resolution", "Team dynamics", "Problem-solving"]
      },
      {
        text: "Describe a project where you had to learn a new technology quickly. What was your approach?",
        difficulty: "easy",
        timeLimit: 150,
        category: "behavioral",
        expectedPoints: ["Learning agility", "Adaptability", "Resource utilization", "Time management"]
      },
      {
        text: "How do you handle tight deadlines and pressure?",
        difficulty: "medium",
        timeLimit: 120,
        category: "behavioral",
        expectedPoints: ["Stress management", "Prioritization", "Time management", "Communication"]
      }
    ],
    cultural: [
      {
        text: "What motivates you in your work, and how do you stay engaged?",
        difficulty: "easy",
        timeLimit: 120,
        category: "cultural",
        expectedPoints: ["Motivation factors", "Self-awareness", "Career goals", "Work values"]
      },
      {
        text: "How do you approach giving and receiving feedback?",
        difficulty: "medium",
        timeLimit: 150,
        category: "cultural",
        expectedPoints: ["Communication skills", "Growth mindset", "Emotional intelligence", "Professional development"]
      }
    ],
    leadership: [
      {
        text: "Describe your leadership style and give an example of when you led a team through a challenge.",
        difficulty: "hard",
        timeLimit: 240,
        category: "leadership",
        expectedPoints: ["Leadership philosophy", "Team management", "Decision making", "Crisis management"]
      }
    ]
  };

  // Generate questions based on configuration
  const generateQuestions = async () => {
    setIsGenerating(true);
    
    try {
      // Combine template questions based on selected categories
      let selectedQuestions = [];
      
      interviewConfig.categories.forEach(category => {
        if (questionTemplates[category]) {
          const categoryQuestions = questionTemplates[category]
            .filter(q => q.difficulty === interviewConfig.difficulty || interviewConfig.difficulty === 'mixed')
            .slice(0, Math.ceil(interviewConfig.duration / 10)); // Roughly 1 question per 10 minutes
          
          selectedQuestions = [...selectedQuestions, ...categoryQuestions];
        }
      });

      // Add custom questions
      const customQs = interviewConfig.customQuestions
        .filter(q => q.trim())
        .map((text, index) => ({
          text: text.trim(),
          difficulty: interviewConfig.difficulty,
          timeLimit: 180,
          category: 'custom',
          expectedPoints: []
        }));

      selectedQuestions = [...selectedQuestions, ...customQs];

      // If AI generation is enabled, enhance questions with candidate-specific context
      if (candidateData) {
        const response = await fetch('/api/ai-engines/adaptive-interviewer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateProfile: candidateData,
            baseQuestions: selectedQuestions,
            interviewConfig: interviewConfig
          })
        });

        if (response.ok) {
          const enhancedQuestions = await response.json();
          selectedQuestions = enhancedQuestions.questions || selectedQuestions;
        }
      }

      // Shuffle and limit questions based on duration
      const maxQuestions = Math.max(3, Math.floor(interviewConfig.duration / 5));
      const shuffled = selectedQuestions.sort(() => 0.5 - Math.random());
      const finalQuestions = shuffled.slice(0, maxQuestions);

      setQuestions(finalQuestions);
      setCurrentStep(1);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      // Fallback to template questions
      const fallbackQuestions = questionTemplates.technical.slice(0, 3);
      setQuestions(fallbackQuestions);
      setCurrentStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  // Start interview
  const startInterview = () => {
    setInterviewStarted(true);
    setCurrentStep(2);
  };

  // Handle interview completion
  const handleInterviewComplete = async (interviewData) => {
    try {
      // Save interview results
      const response = await fetch('/api/analysis/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidateData?.id,
          interviewConfig: interviewConfig,
          ...interviewData
        })
      });

      if (response.ok) {
        const results = await response.json();
        if (onInterviewComplete) {
          onInterviewComplete(results);
        }
      }
    } catch (error) {
      console.error('Failed to save interview results:', error);
    }
  };

  // Configuration step
  const renderConfigurationStep = () => (
    <div className="max-w-4xl mx-auto p-6">
      <Card title="Interview Configuration" className="mb-6">
        <Form layout="vertical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item label="Interview Type">
              <Select
                value={interviewConfig.type}
                onChange={(value) => setInterviewConfig(prev => ({ ...prev, type: value }))}
                size="large"
              >
                <Option value="text">Text Only</Option>
                <Option value="voice">Voice Only</Option>
                <Option value="timed">Timed Questions</Option>
                <Option value="comprehensive">Comprehensive (Voice + Text + AI)</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Duration (minutes)">
              <Select
                value={interviewConfig.duration}
                onChange={(value) => setInterviewConfig(prev => ({ ...prev, duration: value }))}
                size="large"
              >
                <Option value={15}>15 minutes</Option>
                <Option value={30}>30 minutes</Option>
                <Option value={45}>45 minutes</Option>
                <Option value={60}>60 minutes</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Difficulty Level">
              <Select
                value={interviewConfig.difficulty}
                onChange={(value) => setInterviewConfig(prev => ({ ...prev, difficulty: value }))}
                size="large"
              >
                <Option value="easy">Easy</Option>
                <Option value="medium">Medium</Option>
                <Option value="hard">Hard</Option>
                <Option value="mixed">Mixed</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Question Categories">
              <Select
                mode="multiple"
                value={interviewConfig.categories}
                onChange={(value) => setInterviewConfig(prev => ({ ...prev, categories: value }))}
                size="large"
                placeholder="Select categories"
              >
                <Option value="technical">Technical</Option>
                <Option value="behavioral">Behavioral</Option>
                <Option value="cultural">Cultural Fit</Option>
                <Option value="leadership">Leadership</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Custom Questions (Optional)">
            <TextArea
              rows={4}
              placeholder="Enter custom questions, one per line..."
              value={interviewConfig.customQuestions.join('\n')}
              onChange={(e) => setInterviewConfig(prev => ({
                ...prev,
                customQuestions: e.target.value.split('\n')
              }))}
            />
          </Form.Item>
        </Form>

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Estimated questions: {Math.max(3, Math.floor(interviewConfig.duration / 5))}
          </div>
          <Button
            type="primary"
            size="large"
            loading={isGenerating}
            onClick={generateQuestions}
            icon={<CpuChipIcon className="w-5 h-5" />}
          >
            Generate Interview Questions
          </Button>
        </div>
      </Card>

      {/* Interview Type Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card size="small" className="text-center">
          <DocumentTextIcon className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <h4 className="font-medium">Text Interview</h4>
          <p className="text-xs text-gray-600">Traditional text-based Q&A</p>
        </Card>
        
        <Card size="small" className="text-center">
          <MicrophoneIcon className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <h4 className="font-medium">Voice Interview</h4>
          <p className="text-xs text-gray-600">Speech recognition & TTS</p>
        </Card>
        
        <Card size="small" className="text-center">
          <ClockIcon className="w-8 h-8 mx-auto text-orange-500 mb-2" />
          <h4 className="font-medium">Timed Questions</h4>
          <p className="text-xs text-gray-600">Time-limited responses</p>
        </Card>
        
        <Card size="small" className="text-center">
          <CpuChipIcon className="w-8 h-8 mx-auto text-purple-500 mb-2" />
          <h4 className="font-medium">AI Copilot</h4>
          <p className="text-xs text-gray-600">Real-time AI assistance</p>
        </Card>
      </div>
    </div>
  );

  // Preview step
  const renderPreviewStep = () => (
    <div className="max-w-4xl mx-auto p-6">
      <Card title="Interview Preview" className="mb-6">
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{interviewConfig.duration}m</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(questions.reduce((sum, q) => sum + q.timeLimit, 0) / 60)}m
              </div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{interviewConfig.type}</div>
              <div className="text-sm text-gray-600">Type</div>
            </div>
          </div>
        </div>

        <Tabs defaultActiveKey="questions">
          <TabPane tab="Questions" key="questions">
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={index} size="small" className="border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800 flex-1 pr-4">
                      {index + 1}. {question.text}
                    </h4>
                    <div className="flex space-x-2">
                      <Tag color={
                        question.difficulty === 'easy' ? 'green' :
                        question.difficulty === 'medium' ? 'gold' : 'red'
                      }>
                        {question.difficulty}
                      </Tag>
                      <Tag color="blue">{question.timeLimit}s</Tag>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Category:</strong> {question.category}
                  </div>
                  {question.expectedPoints.length > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      <strong>Key Points:</strong> {question.expectedPoints.join(', ')}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabPane>
          
          <TabPane tab="Configuration" key="config">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Interview Type:</strong> {interviewConfig.type}
                </div>
                <div>
                  <strong>Duration:</strong> {interviewConfig.duration} minutes
                </div>
                <div>
                  <strong>Difficulty:</strong> {interviewConfig.difficulty}
                </div>
                <div>
                  <strong>Categories:</strong> {interviewConfig.categories.join(', ')}
                </div>
              </div>
              
              {candidateData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Candidate Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Name:</strong> {candidateData.name}</div>
                    <div><strong>Position:</strong> {candidateData.position}</div>
                    <div><strong>Experience:</strong> {candidateData.experience}</div>
                    <div><strong>Skills:</strong> {candidateData.skills?.join(', ')}</div>
                  </div>
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>

        <div className="flex justify-between items-center mt-6">
          <Button onClick={() => setCurrentStep(0)}>
            Back to Configuration
          </Button>
          <div className="space-x-2">
            <Button onClick={() => setShowPreview(true)}>
              Preview Questions
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={startInterview}
              icon={<PlayIcon className="w-5 h-5" />}
            >
              Start Interview
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Interview step
  const renderInterviewStep = () => (
    <div className="text-center p-8">
      <h3 className="text-xl font-bold mb-4">Interview Feature Coming Soon</h3>
      <p className="text-gray-600">This interview type is under development.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {!interviewStarted && (
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-6">
            <Steps current={currentStep} className="mb-8">
              <Step title="Configuration" description="Set up interview parameters" />
              <Step title="Preview" description="Review questions and settings" />
              <Step title="Interview" description="Conduct the interview" />
            </Steps>
          </div>
        </div>
      )}

      {currentStep === 0 && renderConfigurationStep()}
      {currentStep === 1 && renderPreviewStep()}
      {currentStep === 2 && renderInterviewStep()}

      {/* Preview Modal */}
      <Modal
        title="Question Preview"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={null}
        width={800}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {questions.map((question, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">Q{index + 1}: {question.text}</h4>
                <Tag color="blue">{question.timeLimit}s</Tag>
              </div>
              <div className="text-sm text-gray-600">
                Difficulty: {question.difficulty} | Category: {question.category}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default InterviewManager;