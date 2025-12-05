#!/bin/bash

echo "🧬 Starting HR-GenAI Development Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}⚠️  .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${RED}Please add your OPENAI_API_KEY to .env file${NC}"
    exit 1
fi

# Start MongoDB
echo -e "${BLUE}📊 Starting MongoDB...${NC}"
brew services start mongodb/brew/mongodb-community 2>/dev/null || echo "MongoDB already running"
sleep 2

# Kill existing processes
echo -e "${BLUE}🔄 Cleaning up existing processes...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 1

# Start Backend
echo -e "${BLUE}⚙️  Starting Backend (Port 5000)...${NC}"
cd backend
npm start > /dev/null 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
cd ..
sleep 3

# Check Backend
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend running on http://localhost:5000${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
fi

# Start AI Services
echo -e "${BLUE}🤖 Starting AI Services (Port 8000)...${NC}"
cd ai-services
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
AI_PID=$!
echo $AI_PID > ai.pid
cd ..
sleep 3

# Check AI Services
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ AI Services running on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ AI Services failed to start${NC}"
fi

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend (Port 3000)...${NC}"
cd frontend
npm start > /dev/null 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid
cd ..

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 HR-GenAI is starting up!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC}     http://localhost:3000"
echo -e "${BLUE}⚙️  Backend:${NC}      http://localhost:5000"
echo -e "${BLUE}🤖 AI Services:${NC}  http://localhost:8000"
echo -e "${BLUE}📊 MongoDB:${NC}      mongodb://localhost:27017/hr-genai"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "⏳ Waiting for Frontend to start (this may take 30-60 seconds)..."
echo ""
echo "💡 Tips:"
echo "   • Frontend will open automatically in your browser"
echo "   • To stop all services: ./stop-dev.sh"
echo "   • To view logs: tail -f backend/backend.log"
echo ""
echo "🧬 Ready to revolutionize hiring with AI!"
echo ""

# Wait for user to see the message
sleep 5

# Open browser
if command -v open &> /dev/null; then
    echo "🌐 Opening browser..."
    sleep 10
    open http://localhost:3000
fi