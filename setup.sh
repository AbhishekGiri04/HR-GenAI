#!/bin/bash

echo "🧬 Setting up HR-GenAI Project..."

# Create environment file
echo "📝 Creating environment file..."
cp .env.example .env

# Setup Frontend
echo "🎨 Setting up Frontend..."
cd frontend
npm install
cd ..

# Setup Backend
echo "⚙️ Setting up Backend..."
cd backend
npm install
cd ..

# Setup AI Services
echo "🤖 Setting up AI Services..."
cd ai-services
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "✅ HR-GenAI Setup Complete!"
echo ""
echo "🔧 Next Steps:"
echo "1. Update .env file with your OpenAI API key"
echo "2. Start MongoDB: brew services start mongodb/brew/mongodb-community"
echo "3. Start Backend: cd backend && npm run dev"
echo "4. Start AI Services: cd ai-services && source venv/bin/activate && uvicorn main:app --reload"
echo "5. Start Frontend: cd frontend && npm start"
echo ""
echo "🌟 HR-GenAI will be running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000"
echo "   AI Services: http://localhost:8000"
echo ""
echo "🧬 Ready to revolutionize hiring with Digital DNA!"