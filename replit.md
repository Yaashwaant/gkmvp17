# GreenKarma Wallet - Mobile Carbon Credit Platform

## Overview

GreenKarma Wallet is a mobile-first carbon credit reward platform for EV drivers. The application allows users to upload odometer readings using camera capture, get rewarded based on CO₂ saved, view wallet balance and history, and have readings validated. The app supports both English and Hindi languages and is built as a Progressive Web App (PWA).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
The application follows a monorepo structure with a clear separation between client and server code:

- **Frontend**: React.js with TypeScript, mobile-first PWA design
- **Backend**: Node.js with Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Optimized for Replit hosting environment

### Project Structure
```
/client         - React frontend application
/server         - Express.js backend API
/shared         - Shared TypeScript schemas and types
/migrations     - Database migration files
```

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** as the build tool and development server
- **Tailwind CSS** with custom design system for styling
- **shadcn/ui** components library for consistent UI elements
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management
- **React Hook Form** for form handling and validation

### Mobile-First Design
- PWA capabilities with mobile optimization
- Camera integration using `getUserMedia()` API
- Touch-friendly interface with bottom navigation
- Responsive design using Tailwind CSS breakpoints

### Backend Architecture
- **Express.js** REST API with TypeScript
- **Drizzle ORM** for type-safe database operations
- **Zod** for runtime validation and schema definition
- **Neon Database** (PostgreSQL) for cloud-hosted database
- Memory storage fallback for development/demo purposes

### Database Schema
Two main entities:
- **Users**: User registration with vehicle information
- **Rewards**: Odometer readings and calculated rewards

## Data Flow

### User Registration Flow
1. User enters personal details and vehicle number
2. Optional RC (Registration Certificate) photo capture
3. Vehicle number uniqueness validation
4. User record creation in database

### Odometer Upload Flow
1. Camera capture of odometer reading
2. Optional OCR processing using Tesseract.js
3. Manual reading entry as fallback
4. CO₂ savings calculation based on distance
5. Reward calculation and database storage
6. Real-time wallet balance updates

### Wallet Display Flow
1. Query user wallet data and recent rewards
2. Display current balance and CO₂ savings
3. Show monthly statistics and total distance
4. Recent activity and eco-warrior badge progress

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database client
- **drizzle-orm & drizzle-kit**: Database ORM and migrations
- **@tanstack/react-query**: Server state management
- **tesseract.js**: OCR processing for odometer readings
- **@radix-ui**: Accessible UI components foundation

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Backend bundling for production
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## Deployment Strategy

### Development Environment
- **Replit-optimized**: Special handling for Replit development environment
- **Hot Module Replacement**: Vite HMR for fast development iteration
- **Development middleware**: Custom logging and error handling

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations for schema management
- **Environment Variables**: `DATABASE_URL` required for PostgreSQL connection

### Architecture Decisions

**Database Choice**: PostgreSQL with Drizzle ORM chosen for:
- Type safety with TypeScript integration
- Scalable relational data model
- Cloud hosting compatibility with Neon

**State Management**: TanStack Query selected for:
- Automatic caching and synchronization
- Optimistic updates for better UX
- Background refetching capabilities

**Camera Integration**: Native Web APIs used for:
- Direct browser camera access
- No additional native app requirements
- Cross-platform compatibility

**Internationalization**: Simple JSON-based approach for:
- English and Hindi language support
- Easy translation management
- Minimal bundle size impact

The application is designed to be easily deployable on Replit while maintaining production-ready architecture patterns and scalability considerations.

## Recent Changes (July 20, 2025)

### **Authentication System - Complete ✅**
✓ **Full Authentication Stack**: Username/password and Google Firebase authentication implemented
✓ **Production Security**: Password hashing, session management, input validation, CORS protection
✓ **User Registration**: Email/username uniqueness, vehicle validation, secure signup flow
✓ **Session Management**: 30-day JWT-style tokens with automatic refresh and persistence
✓ **Firebase Integration**: Google OAuth with vehicle data completion flow
✓ **Protected Routes**: Authentication guards with automatic redirects to login
✓ **Mobile UI**: Responsive login/register pages optimized for mobile devices

### **Production Deployment Ready ✅**
✓ **Build Configuration**: Production build scripts with frontend/backend optimization
✓ **Docker Support**: Complete containerization with multi-stage builds and health checks
✓ **Render.com Ready**: Configuration files for one-click deployment
✓ **Environment Setup**: All environment variables documented and configured
✓ **Health Monitoring**: Health check endpoint for production monitoring
✓ **Git Ready**: Complete .gitignore, README.md, and deployment documentation
✓ **Port Configuration**: Dynamic port handling for cloud deployment platforms

## Authentication Features

✓ **Multiple Auth Methods**: Support for traditional username/password and Google Firebase authentication
✓ **Secure Registration**: Email uniqueness validation and vehicle number verification
✓ **Firebase Integration**: Complete Google sign-in flow with additional vehicle information capture
✓ **Session Persistence**: Automatic session restoration on app reload with secure token storage
✓ **Route Protection**: Auth guards for protected pages with automatic redirects
✓ **User Experience**: Seamless switching between authenticated and guest modes

## Blockchain Fraud Prevention System

✓ **Public Blockchain Registry**: Each odometer reading is registered on a public blockchain to prevent reuse across multiple apps
✓ **Cross-App Duplicate Detection**: Automatically detects if the same odometer reading has been used in other carbon reward apps
✓ **Device Fingerprinting**: Tracks device consistency to prevent account switching fraud
✓ **Image Integrity Validation**: Analyzes image metadata to detect photo manipulation
✓ **Impossible Speed Detection**: Validates realistic travel distances based on time intervals
✓ **Transparent Operation**: All fraud prevention works behind the scenes without impacting user experience

### Blockchain Architecture
- **Public Chain Integration**: Connects to external blockchain networks for global fraud database
- **Transaction Recording**: Each valid reading generates a blockchain transaction hash
- **Cross-Platform Security**: Prevents users from claiming rewards for the same odometer reading on multiple apps
- **Automatic Validation**: Real-time fraud detection during odometer upload process

### Security Features
- **Global Fraud Database**: Shared database across all carbon reward platforms
- **Device Consistency Checks**: Monitors for suspicious device changes
- **Location Verification**: Validates GPS accuracy and consistency
- **OCR Confidence Scoring**: Ensures high-quality image text recognition
- **Tamper Detection**: Identifies manipulated or edited images

## Advanced Features Implementation

Moving forward with additional features:
- **Enhanced OCR**: Improved text recognition with validation
- **Geolocation Tracking**: Location-based verification
- **Push Notifications**: Real-time reward notifications
- **Analytics Dashboard**: Advanced user statistics and insights