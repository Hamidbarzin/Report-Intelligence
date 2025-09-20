# Report Intelligence

A modern, AI-powered report analysis and management system with a beautiful dark theme interface.

## Features

- 🌙 **Modern Dark Theme**: Sleek, professional dark UI with excellent readability
- 📊 **AI-Powered Analysis**: Intelligent document analysis using OpenAI
- 📁 **Multi-Format Support**: Upload and analyze various document types (PDF, HTML, TXT, etc.)
- 🔍 **Smart Search & Filtering**: Advanced search and filtering capabilities
- 📈 **Analytics Dashboard**: Comprehensive statistics and insights
- 🔐 **Admin Panel**: Secure admin interface for report management
- 📱 **Responsive Design**: Works perfectly on all devices
- 🌍 **RTL Support**: Full Persian/Arabic language support

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM (with in-memory fallback)
- **AI**: OpenAI API integration
- **Deployment**: Vercel-ready configuration

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hamidbarzin/Report-Intelligence.git
   cd Report-Intelligence
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   JWT_SECRET=your-jwt-secret-here
   ADMIN_PASSWORD=your-admin-password-here
   DATABASE_URL=postgresql://username:password@localhost:5432/reportintel
   OPENAI_API_KEY=your-openai-api-key-here
   PORT=3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

2. **Set Environment Variables**
   In Vercel dashboard, add these environment variables:
   - `JWT_SECRET`: A strong random string
   - `ADMIN_PASSWORD`: Your admin password
   - `DATABASE_URL`: Your PostgreSQL connection string (optional)
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)

3. **Deploy**
   - Vercel will automatically build and deploy your application
   - Your app will be available at `https://your-app.vercel.app`

### Database Setup

The application works with or without a database:

- **With Database**: Set `DATABASE_URL` environment variable
- **Without Database**: Uses in-memory storage (data resets on restart)

For production, we recommend using a PostgreSQL database:
- [Neon](https://neon.tech) (Free tier available)
- [Supabase](https://supabase.com) (Free tier available)
- [Railway](https://railway.app) (Free tier available)

## Usage

### Admin Access

1. Navigate to the admin login page
2. Use the admin password you set in environment variables
3. Access the admin panel for report management

### Uploading Reports

1. Login as admin
2. Click "Upload New Report"
3. Select your document files
4. Wait for AI analysis to complete
5. View the analyzed report

### Viewing Reports

- **Public View**: Browse published reports
- **Admin View**: Manage all reports, including unpublished ones

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `JWT_SECRET` | Secret for JWT token signing | Yes | - |
| `ADMIN_PASSWORD` | Admin login password | Yes | - |
| `DATABASE_URL` | PostgreSQL connection string | No | In-memory storage |
| `OPENAI_API_KEY` | OpenAI API key for AI analysis | No | Mock analysis |
| `PORT` | Server port | No | 3000 |

### Customization

- **Theme**: Modify `client/src/index.css` for color scheme changes
- **Components**: Edit React components in `client/src/components/`
- **API**: Modify server routes in `server/routes.ts`
- **Database**: Update schema in `shared/schema.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

Built with ❤️ using modern web technologies