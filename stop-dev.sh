#!/bin/bash

echo "🛑 Stopping HR-GenAI services..."

# Kill processes on ports
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Frontend stopped"
lsof -ti:5000 | xargs kill -9 2>/dev/null && echo "✅ Backend stopped"
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "✅ AI Services stopped"

# Remove PID files
rm -f backend/backend.pid frontend/frontend.pid ai-services/ai.pid 2>/dev/null

echo ""
echo "✅ All services stopped successfully!"