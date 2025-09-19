# Report Intelligence Platform

A production-ready AI-powered report analysis platform with admin-only uploads and public read access, featuring interactive visualizations and automated document processing.

## Features

- **Admin Authentication**: Secure JWT-based authentication with password protection
- **File Upload**: Support for HTML, PDF, and image files with Supabase storage
- **AI Analysis**: Automated document analysis using OpenAI with structured JSON output
- **Public Dashboard**: Browse published reports with search and filtering
- **Interactive Charts**: Data visualizations using Recharts from AI analysis
- **Report Management**: Complete admin workflow for upload, analyze, publish, delete
- **Responsive Design**: Mobile-friendly interface with dark mode support

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Recharts for data visualization
- TanStack Query for data fetching
- Wouter for routing
- Shadcn/ui components

### Backend
- Express.js with Vercel serverless support
- Supabase (PostgreSQL + Storage)
- OpenAI API for document analysis
- JWT authentication with HttpOnly cookies
- Multer for file uploads

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure the following:

```bash
cp .env.example .env
