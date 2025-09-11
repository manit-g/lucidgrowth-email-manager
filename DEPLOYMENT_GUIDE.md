# Lucid Growth Email Manager - Deployment Guide

## Overview

Simple deployment guide for the Lucid Growth Email Manager using Railway (backend) and Vercel (frontend).

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas (free)
- GitHub account

## Step 1: MongoDB Atlas Setup

1. **Go to:** https://www.mongodb.com/atlas
2. **Sign up** for free
3. **Create cluster:**
   - Choose "Shared" (FREE)
   - Select any cloud provider
   - Choose region closest to you
   - Click "Create Cluster"

4. **Create database user:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `lucidgrowth`
   - Password: `lucidpassword123`
   - Role: "Read and write to any database"
   - Click "Add User"

5. **Network access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Click "Confirm"

6. **Get connection string:**
   - Go to "Clusters"
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with `lucidpassword123`
   - Add `/lucidgrowth` before the `?`

**Final connection string:**
```
mongodb+srv://lucidgrowth:lucidpassword123@cluster0.vuggaan.mongodb.net/lucidgrowth?retryWrites=true&w=majority&appName=Cluster0
```

## Step 2: Deploy Backend to Railway

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `lucidgrowth` repository
   - Select the `backend` folder

4. **Add environment variables:**
   - Click on your project
   - Go to "Variables" tab
   - Add these variables:

```
MONGODB_URI = mongodb+srv://lucidgrowth:lucidpassword123@cluster0.vuggaan.mongodb.net/lucidgrowth?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET = my-super-secret-jwt-key-123
JWT_EXPIRES_IN = 24h
NODE_ENV = production
PORT = 3001
```

5. **Deploy:**
   - Railway will automatically deploy
   - Wait for deployment to complete
   - Copy the URL (like: `https://lucidgrowth-backend.railway.app`)

## Step 3: Deploy Frontend to Vercel

1. **Go to:** https://vercel.com
2. **Sign up** with GitHub
3. **Create new project:**
   - Click "New Project"
   - Choose GitHub
   - Select your `lucidgrowth-email-manager` repository

4. **Configure build settings:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. **Add environment variable:**
   - Go to Project Settings → Environment Variables
   - Add:
```
NEXT_PUBLIC_API_URL = https://lucidgrowth-backend.railway.app
```

6. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - You'll get a URL like: `https://lucidgrowth-email-manager-frontend.vercel.app`

## Step 4: Test Your Deployment

1. **Visit your Vercel URL**
2. **Login with:** username: `admin`, password: `admin123`
3. **Test the application**

## Step 5: Submit Assignment

You now have:
- ✅ **GitHub Repository:** Your code
- ✅ **Live Frontend URL:** Your Vercel URL
- ✅ **Demo Video:** Record yourself using the app

## Troubleshooting

### Backend not working?
- Check Railway logs
- Verify environment variables are set correctly
- Make sure MongoDB connection string is correct

### Frontend not connecting to backend?
- Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Make sure backend URL is correct
- Check browser console for errors

### MongoDB connection issues?
- Verify database user has correct permissions
- Check network access allows all IPs
- Make sure password is correct in connection string

## Support

For issues, check the logs in Railway and Vercel dashboards.