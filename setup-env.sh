#!/bin/bash
# LUXE Full Stack - Environment Setup Script

echo "🚀 LUXE Full Stack Environment Setup"
echo "===================================="
echo ""

# Backend Setup
echo "📦 Backend Setup (Render)"
echo "------------------------"
echo "1. Go to Render Dashboard → Your Backend Service"
echo "2. Click Settings → Environment Variables"
echo "3. Add these variables:"
echo ""
echo "   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/luxe-ecommerce"
echo "   JWT_SECRET = your-secret-key-here"
echo "   NODE_ENV = production"
echo ""
echo "4. Click Save and then Manual Deploy"
echo ""

# Frontend Setup
echo "🎨 Frontend Setup (Vercel)"
echo "------------------------"
echo "1. Go to Vercel Dashboard → Your Frontend Project"
echo "2. Click Settings → Environment Variables"
echo "3. Add this variable:"
echo ""
echo "   REACT_APP_API_URL = https://your-render-service-name.onrender.com/api"
echo ""
echo "4. Click Save and Redeploy"
echo ""

# Local Development
echo "💻 Local Development Setup"
echo "------------------------"
echo ""
echo "Backend:"
echo "  1. Create .env file in root directory with:"
cat << 'EOF'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/luxe-ecommerce
JWT_SECRET=your-dev-secret-key
NODE_ENV=development
EOF
echo ""
echo "  2. Run: npm install"
echo "  3. Run: npm run dev"
echo ""

echo "Frontend:"
echo "  1. cd luxe-frontend"
echo "  2. Create .env.local with:"
echo "     REACT_APP_API_URL=http://localhost:5000/api"
echo "  3. Run: npm install"
echo "  4. Run: npm start"
echo ""

echo "✅ Setup complete!"
