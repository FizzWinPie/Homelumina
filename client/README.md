# Homelumina Client

A modern React application for data-driven real estate insights and neighborhood analysis.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:8080`

## ⚙️ Configuration

### API Configuration

The application uses environment variables for API configuration to support different environments (development, staging, production).

#### Environment Variables

Create a `.env` file in the client directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Development settings
VITE_APP_ENV=development
VITE_APP_NAME=Homelumina

# firebase settings (ask John)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

#### Default Configuration

If no environment variables are set, the application uses these defaults:
- **API Base URL**: `http://localhost:3000`
- **Environment**: `development`
- **App Name**: `Homelumina`

#### Production Configuration

For production deployment, update the environment variables:

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_ENV=production
VITE_APP_NAME=Homelumina
```

### API Endpoints

The application uses a centralized API configuration system located in `src/config/api.ts`. This ensures:

- ✅ **Environment Flexibility**: Easy switching between development, staging, and production
- ✅ **No Hardcoded URLs**: All API calls use the configuration system
- ✅ **Type Safety**: TypeScript support for API endpoints
- ✅ **Maintainability**: Single source of truth for API configuration

#### Available Endpoints

- **Autocomplete**: `/api/v1/search/autocomplete`
- **City Comparison**: `/api/v1/analytics/city-aggregate-comparison`
- **Real Estate**: `/api/v1/real-estate/affordable-zipcodes`
- **Health Data**: `/api/v1/health/community/{zipcode}`

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API server running (default: `http://localhost:3000`)

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🏗️ Architecture

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router
- **State Management**: React hooks

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── config/             # Configuration files (API, etc.)
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔧 Troubleshooting

### API Connection Issues

1. **Check API Server**: Ensure the backend server is running
2. **Verify URL**: Check `VITE_API_BASE_URL` in your `.env` file
3. **CORS Issues**: Ensure the backend allows requests from the client origin
4. **Port Conflicts**: Verify no other services are using port 8080

### Build Issues

1. **Environment Variables**: Ensure all required env vars are set
2. **Dependencies**: Run `npm install` to install missing packages
3. **TypeScript Errors**: Check for type mismatches in API responses
