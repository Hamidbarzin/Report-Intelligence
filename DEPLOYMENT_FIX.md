# 🔧 Fix for 502 Bad Gateway Error

## Problem:
The app is getting 502 Bad Gateway error on Render because environment variables are missing.

## Solution:

### 1. Go to Render Dashboard:
- Click on your service "Report-Intelligence"
- Go to **"Environment"** tab
- Add these environment variables:

```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-here
ADMIN_PASSWORD=admin123
PORT=10000
```

### 2. Manual Deploy:
- Click **"Manual Deploy"**
- Select **"Deploy latest commit"**

### 3. Wait for deployment:
- Check the logs to see if it's working
- The app should be available at: `https://report-intelligence.onrender.com`

## Alternative: Use Render CLI

If you have Render CLI installed:

```bash
# Set environment variables
render env set JWT_SECRET=your-super-secure-jwt-secret-here
render env set ADMIN_PASSWORD=admin123
render env set NODE_ENV=production
render env set PORT=10000

# Deploy
render deploy
```

## Test locally:
```bash
NODE_ENV=production JWT_SECRET=test-secret ADMIN_PASSWORD=admin123 PORT=3000 npm start
```

## Expected result:
- App should start without errors
- API should respond at `/`
- Admin panel should work at `/admin`
