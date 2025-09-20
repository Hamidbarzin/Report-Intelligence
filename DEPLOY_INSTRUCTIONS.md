# 🚀 Report Intelligence - Railway Deployment

## Quick Deployment Steps

Since Railway CLI requires browser login, here's the easiest way to deploy:

### Method 1: Railway Web Interface (Recommended)

1. **Go to [railway.app](https://railway.app)**
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your `Report-Intelligence` repository**
5. **Railway will automatically detect and deploy!**

### Method 2: One-Click Deploy

Click this button to deploy directly:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Hamidbarzin/Report-Intelligence)

### Environment Variables to Set

In Railway dashboard, add these variables:

```
JWT_SECRET=your-super-secret-jwt-key-here-12345
ADMIN_PASSWORD=admin123
NODE_ENV=production
```

### Optional Variables (for enhanced features):

```
DATABASE_URL=postgresql://... (for persistent storage)
OPENAI_API_KEY=sk-... (for AI analysis)
```

## What Happens After Deployment

✅ **Automatic Build**: Railway builds your app using `npm run build`
✅ **Live URL**: You get a URL like `https://your-app.railway.app`
✅ **All Features Work**: Dark theme, file upload, admin panel, Persian RTL
✅ **Backend Storage**: Data is stored and persists

## Features Included

- 🎨 Modern dark theme with excellent readability
- 📁 Multi-format file support (PDF, HTML, TXT)
- 🤖 AI-powered document analysis
- 👨‍💼 Admin panel for report management
- 🌍 Persian RTL support
- 📱 Responsive design
- ⏰ Upload date/time display
- 💾 Backend data storage

## Troubleshooting

If deployment fails:
1. Check that all environment variables are set
2. Ensure `JWT_SECRET` is a strong, random string
3. Verify `ADMIN_PASSWORD` is set
4. Check Railway logs for any errors

Your app will be live and fully functional once deployed! 🎉
