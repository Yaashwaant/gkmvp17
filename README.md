# 🌱 GreenKarma Wallet

A mobile-first carbon credit reward platform for EV drivers. Upload odometer readings, get rewarded for CO₂ saved, and track your environmental impact.

## ✨ Features

### 🔐 **Complete Authentication System**
- Username/password registration and login
- Google Firebase authentication integration
- Secure session management with 30-day tokens
- Password hashing and input validation

### 📱 **Mobile-First PWA**
- Camera integration for odometer capture
- OCR text recognition using Tesseract.js
- Touch-optimized interface with bottom navigation
- Responsive design for all screen sizes

### 💰 **Wallet & Rewards**
- Real-time balance tracking
- CO₂ savings calculation
- Monthly reward statistics
- Transaction history and analytics

### 🛡️ **Security & Fraud Prevention**
- Blockchain integration for global fraud prevention
- Device fingerprinting and consistency checks
- Image integrity validation
- Impossible speed detection

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install
npm run build
npm start
```

## 🔧 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/dbname

# Firebase Authentication
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id

# Application
NODE_ENV=production
PORT=5000
```

## 📦 Deployment

### Render.com
1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy using provided `render.yaml` configuration

### Docker
```bash
docker build -t greenkarma-wallet .
docker run -p 5000:5000 greenkarma-wallet
```

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT sessions + Firebase Auth
- **State Management**: TanStack Query
- **Camera**: Web API + OCR processing

## 🔐 Firebase Setup

1. Create Firebase project
2. Enable Google authentication
3. Add your deployment domain to authorized domains
4. Configure environment variables

## 📱 Mobile Features

- Progressive Web App (PWA) capabilities
- Camera access for odometer photos
- Offline functionality ready
- Touch-optimized interface
- Bottom navigation for mobile UX

## 🌍 Internationalization

- English and Hindi language support
- Easy translation management
- Minimal bundle size impact

## 🏆 Admin Dashboard

- User management and statistics
- Real-time activity monitoring
- System health and performance metrics
- CO₂ impact tracking

## 📊 Analytics

- User engagement tracking
- Environmental impact metrics
- Reward distribution analytics
- Mobile usage optimization

---

**Ready for production deployment with complete authentication, mobile optimization, and environmental impact tracking!**