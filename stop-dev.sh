#!/bin/bash

echo ""
echo "🛑 Stopping HR-GenAI services..."
echo ""

# Kill processes on ports
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Frontend stopped (Port 3000)"
lsof -ti:5001 | xargs kill -9 2>/dev/null && echo "✅ Backend stopped (Port 5001)"

# Kill by process name
pkill -9 -f "react-scripts" 2>/dev/null
pkill -9 -f "node.*backend" 2>/dev/null
pkill -9 -f "nodemon" 2>/dev/null

# Remove PID files
rm -f backend/backend.pid frontend/frontend.pid 2>/dev/null

echo ""
echo "✅ All services stopped successfully!"
echo ""
