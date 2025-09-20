# Render Deployment Guide for ReportIntel

## Prerequisites
1. A GitHub account
2. A Render account (free tier available)
3. Your code pushed to a GitHub repository

## Step 1: Push to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub and push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your ReportIntel repository
5. Configure the service:

### Basic Settings:
- **Name**: `report-intel` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (uses root)

### Build & Deploy:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Environment Variables:
Add these in the Render dashboard:
- `NODE_ENV` = `production`
- `JWT_SECRET` = Generate a secure random string (or use Render's auto-generate)
- `ADMIN_PASSWORD` = `admin123` (change this to something secure)
- `PORT` = `10000` (Render will set this automatically)

### Advanced Settings:
- **Health Check Path**: `/`
- **Auto-Deploy**: Enable (deploys automatically on git push)

## Step 3: Custom Domain (Optional)

1. In your Render service dashboard, go to "Settings"
2. Click "Custom Domains"
3. Add your domain (e.g., `reportintel.yourdomain.com`)
4. Follow Render's DNS configuration instructions
5. Update your domain's DNS records as instructed

## Step 4: Environment Variables for Production

### Required Variables:
```bash
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-here
ADMIN_PASSWORD=your-secure-admin-password
PORT=10000
```

### Optional Variables (for enhanced features):
```bash
# Database (if you want to use PostgreSQL instead of in-memory)
DATABASE_URL=postgresql://username:password@host:port/database

# OpenAI API (for AI analysis features)
OPENAI_API_KEY=your-openai-api-key

# Supabase (for cloud storage)
VITE_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
```

## Step 5: Access Your Application

After deployment:
- **URL**: `https://your-app-name.onrender.com`
- **Admin Panel**: `https://your-app-name.onrender.com/admin`
- **Login**: Use the admin password you set

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **App Crashes**: Check the logs in Render dashboard
3. **Environment Variables**: Ensure all required variables are set
4. **Port Issues**: Render automatically sets PORT, don't override it

### Checking Logs:
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. Check for any error messages

## Security Notes

1. **Change Default Password**: Update `ADMIN_PASSWORD` to something secure
2. **JWT Secret**: Use a strong, random JWT secret
3. **HTTPS**: Render provides HTTPS by default
4. **Environment Variables**: Never commit secrets to git

## Features Available After Deployment

- ✅ File upload and analysis
- ✅ AI-powered report insights
- ✅ Admin dashboard
- ✅ Report management
- ✅ Public report viewing
- ✅ Responsive design
- ✅ Persian/English interface

## Support

If you encounter issues:
1. Check Render's documentation
2. Review the logs in Render dashboard
3. Ensure all environment variables are set correctly
4. Verify your GitHub repository is properly connected
