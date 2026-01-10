const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
require('dotenv').config();

const connectDB = require('./config/database');
const candidateRoutes = require('./routes/candidates');
const genomeRoutes = require('./routes/genome');
const analyticsRoutes = require('./routes/analytics');
const aiCompletionRoutes = require('./routes/aiCompletion');
const hrInterviewRoutes = require('./routes/hrInterview');
const templateRoutes = require('./routes/templates');
const interviewRoutes = require('./routes/interview');
const invitationRoutes = require('./routes/invitations');
const autoHireRoutes = require('./routes/autoHire');
const humaRoutes = require('./routes/huma');
const humaTestRoutes = require('./routes/humaTest');
const autoScheduleRoutes = require('./routes/autoSchedule');
const evaluationRoutes = require('./routes/evaluation');
const debugRoutes = require('./routes/debug');
const autoEvalRoutes = require('./routes/autoEval');
const interviewHandler = require('./services/interviewCompletionHandler');
const websocketService = require('./services/websocketService');
const templateScheduler = require('./services/templateScheduler');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Initialize WebSocket service
websocketService.initialize(server);

// Connect to MongoDB
connectDB();

// Start template scheduler
templateScheduler.start();

// Initialize interview completion handler
console.log('🤖 Auto-evaluation system initialized');

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/candidates', candidateRoutes);
app.use('/api/genome', genomeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', aiCompletionRoutes);
app.use('/api/hr', hrInterviewRoutes);
app.use('/api/hr', templateRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api', autoHireRoutes);
app.use('/api/huma', humaRoutes);
app.use('/api/huma', humaTestRoutes);
app.use('/api/schedule', autoScheduleRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/auto-eval', autoEvalRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'HR-GenAI API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to HR-GenAI - AI-Powered Hiring Intelligence Platform',
    endpoints: {
      health: '/health',
      candidates: '/api/candidates',
      templates: '/api/hr/templates',
      invitations: '/api/invitations',
      interview: '/api/interview'
    },
    documentation: 'https://github.com/AbhishekGiri04/HR-GenAI'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'HR-GenAI API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(PORT, () => {
  console.log(`🚀 HR-GenAI Server running on port ${PORT}`);
  console.log(`📡 WebSocket service active`);
});