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
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}⚠️  .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please add your OPENAI_API_KEY and GEMINI_API_KEY to .env file${NC}"
    exit 1
fi

# Stop existing processes
echo -e "${BLUE}🔄 Stopping existing services...${NC}"
pkill -9 -f "react-scripts" 2>/dev/null
pkill -9 -f "node.*backend" 2>/dev/null
pkill -9 -f "nodemon" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5001 | xargs kill -9 2>/dev/null
sleep 2
echo -e "${GREEN}✅ Cleanup complete${NC}"
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

# Start Backend
echo -e "${BLUE}⚙️  Starting Backend (Port 5001)...${NC}"
cd backend
if [ ! -f .env ]; then
    cp ../.env .env 2>/dev/null
fi
PORT=5001 npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
cd ..
sleep 8

if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend running on http://localhost:5001${NC}"
else
    echo -e "${RED}❌ Backend failed - Check backend/backend.log${NC}"
fi
echo ""

# Seed templates
echo -e "${BLUE}🌱 Seeding interview templates...${NC}"
cd backend
npm run seed-templates > /dev/null 2>&1
cd ..
echo -e "${GREEN}✅ Templates ready${NC}"
echo ""

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend (Port 3000)...${NC}"
cd frontend
npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid
cd ..
sleep 15

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend running on http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend still starting...${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}     🎉 ALL SERVICES STARTED! 🎉${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}📱 Frontend:${NC}  http://localhost:3000"
echo -e "${BLUE}⚙️  Backend:${NC}   http://localhost:5001"
echo -e "${BLUE}📊 MongoDB:${NC}   mongodb://localhost:27017/hr-genai"
echo ""
echo -e "${YELLOW}💡 Commands:${NC}"
echo "   Stop all: ./stop-dev.sh"
echo "   Backend logs: tail -f backend/backend.log"
echo "   Frontend logs: tail -f frontend/frontend.log"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
