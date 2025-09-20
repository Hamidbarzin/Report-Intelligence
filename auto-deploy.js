#!/usr/bin/env node

import https from 'https';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting automatic deployment to Railway...');

// Create a simple deployment script
const deployScript = `
#!/bin/bash
echo "🚀 Deploying Report Intelligence to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Try to login (this will open browser)
echo "🔐 Please login to Railway in your browser..."
railway login

# Create new project
echo "📁 Creating Railway project..."
railway init --name "report-intelligence"

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
`;

// Write the script
fs.writeFileSync('deploy-railway.sh', deployScript);
fs.chmodSync('deploy-railway.sh', '755');

console.log('✅ Created deployment script: deploy-railway.sh');
console.log('📝 To deploy, run: ./deploy-railway.sh');
console.log('🌐 Or go to: https://railway.app/new/github?repo=Hamidbarzin/Report-Intelligence');
