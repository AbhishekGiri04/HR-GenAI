#!/bin/bash

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🧬 HR-GenAI - AI-Powered Hiring Intelligence Platform"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}⚠️  .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please add your OPENAI_API_KEY to .env file${NC}"
    exit 1
fi

# Kill ALL existing processes
echo -e "${BLUE}🔄 Stopping all existing services...${NC}"
pkill -9 -f "react-scripts" 2>/dev/null
pkill -9 -f "node.*backend" 2>/dev/null
pkill -9 -f "nodemon" 2>/dev/null
pkill -9 -f "uvicorn" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 3
echo -e "${GREEN}✅ All processes stopped${NC}"
echo ""

# Start MongoDB
echo -e "${BLUE}📊 Starting MongoDB...${NC}"
if pgrep -x mongod > /dev/null; then
    echo -e "${GREEN}✅ MongoDB already running${NC}"
else
    brew services start mongodb/brew/mongodb-community 2>/dev/null || sudo systemctl start mongod 2>/dev/null
    sleep 3
    if pgrep -x mongod > /dev/null; then
        echo -e "${GREEN}✅ MongoDB started${NC}"
    else
        echo -e "${RED}❌ MongoDB failed to start${NC}"
    fi
fi
echo ""

# Start Backend (Port 5001)
echo -e "${BLUE}⚙️  Starting Backend (Port 5001)...${NC}"
cd backend
if [ ! -f .env ]; then
    cp ../.env .env 2>/dev/null
fi
PORT=5001 npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
cd ..
echo "Waiting for backend to start..."
sleep 8

if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend running on http://localhost:5001${NC}"
else
    echo -e "${RED}❌ Backend failed to start - Check backend/backend.log${NC}"
fi
echo ""

# Start AI Services (Optional)
echo -e "${BLUE}🤖 Starting AI Services (Port 8000)...${NC}"
if [ -d "ai-services" ] && [ -d "ai-services/venv" ]; then
    cd ai-services
    source venv/bin/activate 2>/dev/null
    uvicorn main:app --host 0.0.0.0 --port 8000 > ai.log 2>&1 &
    AI_PID=$!
    echo $AI_PID > ai.pid
    cd ..
    sleep 4
    if curl -s http://localhost:8000/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ AI Services running on http://localhost:8000${NC}"
    else
        echo -e "${YELLOW}⚠️  AI Services failed (optional)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  AI Services not configured (optional)${NC}"
fi
echo ""

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend (Port 3000)...${NC}"
cd frontend
npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid
cd ..
echo "Waiting for frontend to compile..."
sleep 15

# Check Frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend running on http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend still starting... (check frontend/frontend.log)${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}     🎉 ALL SERVICES STARTED SUCCESSFULLY! 🎉${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}📱 Frontend:${NC}      http://localhost:3000"
echo -e "${BLUE}⚙️  Backend:${NC}       http://localhost:5001"
echo -e "${BLUE}🤖 AI Services:${NC}   http://localhost:8000 (optional)"
echo -e "${BLUE}📊 MongoDB:${NC}       mongodb://localhost:27017/hr-genai"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📋 PROCESS IDs:${NC}"
echo "   Backend PID: $BACKEND_PID (saved in backend/backend.pid)"
echo "   Frontend PID: $FRONTEND_PID (saved in frontend/frontend.pid)"
if [ ! -z "$AI_PID" ]; then
    echo "   AI Services PID: $AI_PID (saved in ai-services/ai.pid)"
fi
echo ""
echo -e "${YELLOW}💡 COMMANDS:${NC}"
echo "   Stop all:     ./stop-dev.sh"
echo "   Backend logs: tail -f backend/backend.log"
echo "   Frontend logs: tail -f frontend/frontend.log"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}🚀 FEATURES ENABLED:${NC}"
echo "   ✅ AI Voice Interviewer (Huma)"
echo "   ✅ Resume Extraction (GPT-4)"
echo "   ✅ Random Question Generation"
echo "   ✅ Strict Tab Enforcement"
echo "   ✅ Email Notifications"
echo "   ✅ Real-time Proctoring"
echo "   ✅ Personality Detection (MBTI)"
echo "   ✅ EQ Analysis"
echo "   ✅ Hiring Probability"
echo "   ✅ Complete DNA Profiling"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}🚀 Opening browser in 5 seconds...${NC}"
echo ""

# Don't auto-open browser
echo -e "${YELLOW}📱 Open browser manually: http://localhost:3000${NC}"

echo ""
echo -e "${GREEN}🧬 HR-GenAI is ready! Start hiring with AI! 🎉${NC}"
echo ""