#!/bin/bash

echo "🚀 Preparing ReportIntel for Render deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📋 Next steps for Render deployment:"
    echo "1. Push your code to GitHub:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "2. Go to https://render.com and create a new Web Service"
    echo "3. Connect your GitHub repository"
    echo "4. Use these settings:"
    echo "   - Build Command: npm install && npm run build"
    echo "   - Start Command: npm start"
    echo "   - Environment: Node"
    echo ""
    echo "5. Set these environment variables in Render:"
    echo "   - NODE_ENV=production"
    echo "   - JWT_SECRET=your-secure-jwt-secret"
    echo "   - ADMIN_PASSWORD=your-secure-admin-password"
    echo "   - PORT=10000"
    echo ""
    echo "6. Deploy and enjoy your ReportIntel app! 🎉"
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi
