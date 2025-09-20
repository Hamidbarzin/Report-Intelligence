#!/bin/bash

echo "🚀 Deploying Report Intelligence to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (this will open browser)
echo "🔐 Please login to Railway in your browser..."
railway login

# Initialize project
echo "📁 Initializing Railway project..."
railway init

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set JWT_SECRET="your-super-secret-jwt-key-here-12345"
railway variables set ADMIN_PASSWORD="admin123"
railway variables set NODE_ENV="production"

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your app will be available at the URL provided by Railway"
