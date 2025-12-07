#!/bin/bash

echo "🛑 Stopping HR-GenAI services..."

# Kill processes on ports
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Frontend stopped"
lsof -ti:5001 | xargs kill -9 2>/dev/null && echo "✅ Backend stopped"
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "✅ AI Services stopped"

# Kill by process name
pkill -9 -f "react-scripts" 2>/dev/null
pkill -9 -f "node.*backend" 2>/dev/null
pkill -9 -f "nodemon" 2>/dev/null
pkill -9 -f "uvicorn" 2>/dev/null

# Remove PID files
rm -f backend/backend.pid frontend/frontend.pid ai-services/ai.pid 2>/dev/null

echo ""
echo "✅ All services stopped successfully!"