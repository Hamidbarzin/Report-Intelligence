# Report Intelligence Platform

## Overview

Report Intelligence is a production-ready AI-powered document analysis platform that enables admin-only uploads with public read access. The system processes HTML, PDF, and image files through automated AI analysis to generate executive summaries, KPIs, interactive charts, and actionable monthly plans. The platform features a modern React frontend with a serverless Express backend, utilizing Supabase for data storage and OpenAI for intelligent document processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18 + Vite**: Modern build system with fast HMR and optimized production builds
- **Tailwind CSS + Shadcn/UI**: Utility-first styling with pre-built component library for consistent design
- **TanStack Query**: Data fetching and caching with automatic invalidation and background updates
- **Wouter**: Lightweight client-side routing for SPA navigation
- **Recharts**: Chart rendering library for data visualization from AI analysis

### Backend Architecture
- **Express.js + Vercel Serverless**: Node.js server with serverless deployment support
- **JWT Authentication**: Admin-only access control using HttpOnly cookies with 24-hour expiration
- **Multer File Processing**: Multi-file upload handling with 20MB limit and type validation
- **Document Extraction Pipeline**: Text extraction from HTML (JSDOM), PDF (pdf-parse), and images
- **AI Analysis Integration**: OpenAI API integration with structured JSON schema validation

### Data Storage & Management
- **Drizzle ORM**: Type-safe database queries with PostgreSQL support
- **Supabase Integration**: PostgreSQL database for metadata + Storage bucket for files
- **In-Memory File Storage**: Temporary file handling during processing pipeline
- **Schema-First Design**: Strict TypeScript interfaces for reports, files, and AI analysis data

### Authentication & Authorization
- **Admin-Only Upload Model**: Password-based admin authentication with JWT tokens
- **Public Read Access**: Unauthenticated users can view published reports
- **Cookie-Based Sessions**: Secure HttpOnly cookies with SameSite=Strict for CSRF protection
- **Route Protection**: Server-side middleware validates admin access for sensitive operations

### AI Processing Pipeline
- **Multi-Format Support**: Text extraction from HTML, PDF, and image documents
- **Structured Output**: JSON schema enforcement for consistent AI responses
- **Analysis Components**: Executive summaries, KPIs with trends, interactive charts, and 4-week action plans
- **Fallback Handling**: Graceful degradation when AI services are unavailable

## External Dependencies

### Core Services
- **Supabase**: PostgreSQL database hosting and file storage bucket management
- **OpenAI API**: Document analysis and structured content generation
- **Vercel**: Serverless deployment platform for production hosting

### NPM Packages
- **@supabase/supabase-js**: Database and storage client integration
- **@tanstack/react-query**: Client-side data fetching and state management
- **drizzle-orm**: Type-safe database ORM with migration support
- **jsonwebtoken**: JWT token generation and validation for authentication
- **multer**: File upload handling and processing middleware
- **pdf-parse**: PDF document text extraction capabilities
- **jsdom**: HTML document parsing and text extraction
- **recharts**: Chart rendering and data visualization components

### Development Tools
- **Vite**: Build tool with TypeScript support and hot module replacement
- **TypeScript**: Static type checking across frontend and backend
- **Tailwind CSS**: Utility-first CSS framework with design system
- **ESBuild**: Fast JavaScript bundling for serverless deployment