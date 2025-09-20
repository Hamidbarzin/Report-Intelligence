# Railway Deployment Guide

## Deploy to Railway

1. **Go to Railway Dashboard**: Visit [railway.app](https://railway.app) and sign in with your GitHub account.

2. **Create New Project**: Click "New Project" and select "Deploy from GitHub repo".

3. **Select Repository**: Choose your `Report-Intelligence` repository.

4. **Configure Environment Variables**: Add the following environment variables in Railway dashboard:
   - `JWT_SECRET`: A strong, random string (e.g., `your-super-secret-jwt-key-here`)
   - `ADMIN_PASSWORD`: Your admin password (e.g., `admin123`)
   - `DATABASE_URL`: (Optional) PostgreSQL connection string for persistent storage
   - `OPENAI_API_KEY`: (Optional) Your OpenAI API key for AI analysis
   - `NODE_ENV`: `production`
   - `PORT`: Railway will automatically set this

5. **Deploy**: Railway will automatically build and deploy your application.

## Database Setup (Optional)

For persistent data storage, you can add a PostgreSQL database:

1. In your Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will provide a `DATABASE_URL` automatically
3. Copy this URL and add it as an environment variable

## Application Features

- **Modern Dark Theme**: Professional dark UI with excellent readability
- **AI-Powered Analysis**: Document analysis with OpenAI (if API key provided)
- **Multi-format Support**: PDF, HTML, and TXT file uploads
- **Admin Panel**: Manage reports and trigger AI analysis
- **Persian RTL Support**: Right-to-left layout for Persian language
- **Responsive Design**: Works on all screen sizes

## Access Your Application

Once deployed, Railway will provide you with a URL like:
`https://your-app-name.railway.app`

The application will be available at this URL with all features working.
