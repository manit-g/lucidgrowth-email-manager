# Lucid Growth Email Manager

A comprehensive email management application that provides centralized access to multiple email accounts across different IMAP servers with advanced analytics and processing capabilities.

**Developer:** Manit  
**Company:** Lucid Growth

## 🚀 Features

- **Multi-IMAP Support**: Connect to multiple email accounts across different IMAP servers simultaneously
- **Connection Pooling**: Efficient handling of multiple concurrent operations
- **Authentication Methods**: Support for OAuth2, PLAIN, and LOGIN authentication
- **Email Synchronization**: Preserve folder hierarchies, message flags, and original dates
- **Real-time Analytics**: ESP detection, TLS validation, and sending domain analysis
- **Full-text Search**: Search across all processed email content
- **Responsive UI**: Modern, mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: Next.js with React
- **Backend**: Node.js with NestJS framework
- **Database**: MongoDB
- **Authentication**: OAuth2, PLAIN, LOGIN

## 📦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)



2. **Install dependencies:**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Set up environment variables:**

**Backend** - Create `backend/.env`:
```bash
MONGODB_URI=mongodb://localhost:27017/lucidgrowth
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend** - Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. **Start MongoDB** (if running locally):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

5. **Start the application:**
```bash
# From project root - starts both backend and frontend
npm run dev

# Or start them separately:
# Backend only
npm run dev:backend

# Frontend only  
npm run dev:frontend
```

6. **Access the application:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs

### Demo Login
- **Username:** admin
- **Password:** admin123

## 🏗️ Project Structure

```
lucidgrowth-email-manager/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   └── main.ts         # Application entry point
│   └── package.json
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Next.js pages
│   │   └── styles/         # CSS styles
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Email Accounts
- `POST /api/accounts` - Add new email account
- `GET /api/accounts` - List all accounts
- `DELETE /api/accounts/:id` - Remove account

### Email Sync
- `POST /api/sync/start` - Start email synchronization
- `POST /api/sync/pause` - Pause synchronization
- `POST /api/sync/resume` - Resume synchronization

### Analytics
- `GET /api/analytics/esp` - Get ESP analytics
- `GET /api/analytics/domains` - Get domain analytics
- `GET /api/analytics/tls` - Get TLS validation results

### Search
- `GET /api/search` - Full-text search across emails

## 🚀 Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `cd frontend && npm run build`
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
4. Deploy

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Select the `backend` folder
3. Set environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure JWT secret key
   - `JWT_EXPIRES_IN`: 24h
   - `NODE_ENV`: production
   - `PORT`: 3001
4. Deploy

### Database (MongoDB Atlas)
1. Create a free MongoDB Atlas cluster
2. Create database user with "Read and write to any database" role
3. Get your connection string
4. Use it as `MONGODB_URI` in Railway

## 📱 Demo

[Live Demo Link](#) - *To be updated after deployment*

## 👨‍💻 Author

**Manit** - Software Developer at Lucid Growth

## 📄 License

This project is proprietary software developed for Lucid Growth.