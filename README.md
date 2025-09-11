# Lucid Growth Email Manager

A comprehensive email management application that provides centralized access to multiple email accounts across different IMAP servers with advanced analytics and processing capabilities.

## 🚀 Live Demo

- **Frontend**: [lucidgrowth-email-manager-frontend.vercel.app](https://lucidgrowth-email-manager-frontend.vercel.app)
- **Backend**: Deploy to Railway or Render
- **Database**: MongoDB Atlas

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, NestJS, TypeScript
- **Database**: MongoDB with Mongoose
- **Deployment**: Vercel (Frontend), Railway/Render (Backend), MongoDB Atlas (Database)

## 📋 Features

- **Multi-Account Management**: Connect and manage multiple email accounts
- **IMAP Integration**: Support for various IMAP servers with connection pooling
- **Authentication Methods**: OAuth2, PLAIN, and LOGIN authentication
- **Email Synchronization**: Real-time sync with pause/resume capabilities
- **Advanced Analytics**: ESP detection, TLS validation, time delta analysis
- **Full-Text Search**: Search across all email content
- **Modern UI**: Responsive design with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/manit-g/lucidgrowth-email-manager.git
   cd lucidgrowth-email-manager
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   - Copy `backend/env.example` to `backend/.env`
   - Copy `frontend/env.local.example` to `frontend/.env.local`
   - Configure your MongoDB Atlas connection string

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. Add environment variable: `NEXT_PUBLIC_API_URL` (your backend URL)

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set build settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start:prod`
3. Add environment variables (MONGODB_URI, JWT_SECRET, etc.)

### Database (MongoDB Atlas)
1. Create a free cluster on MongoDB Atlas
2. Get your connection string
3. Add it to your backend environment variables

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Project Summary](PROJECT_SUMMARY.md)

## 👨‍💻 Author

**Manit** - Lucid Growth

## 📄 License

This project is proprietary software developed for Lucid Growth.
