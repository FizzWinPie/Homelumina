// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider, 
  type Auth
} from "firebase/auth";
import { logger } from '@/utils/logger';
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Check if Firebase environment variables are properly configured
const hasValidFirebaseConfig = () => {
  return import.meta.env.VITE_FIREBASE_API_KEY && 
         import.meta.env.VITE_FIREBASE_AUTH_DOMAIN && 
         import.meta.env.VITE_FIREBASE_PROJECT_ID &&
         import.meta.env.VITE_FIREBASE_API_KEY !== "placeholder" &&
         import.meta.env.VITE_FIREBASE_API_KEY !== "";
};

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "placeholder",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "placeholder",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "placeholder",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "placeholder",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "placeholder",
};

// Initialize Firebase only if configuration is valid
let app: any;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let githubProvider: OAuthProvider | null = null;

if (hasValidFirebaseConfig()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Initialize all authentication providers
    googleProvider = new GoogleAuthProvider();
    githubProvider = new OAuthProvider('github.com');
    
    logger.info("Firebase initialized successfully with all providers");
  } catch (error) {
    logger.warn("Firebase initialization failed", { error });
    auth = null;
  }
} else {
  logger.warn("Firebase not configured. Authentication features will be disabled.");
  logger.warn("To enable Firebase, add your credentials to the .env file:");
  logger.warn("VITE_FIREBASE_API_KEY=your-api-key");
  logger.warn("VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com");
  logger.warn("VITE_FIREBASE_PROJECT_ID=your-project-id");
  logger.warn("VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com");
  logger.warn("VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id");
  logger.warn("VITE_FIREBASE_APP_ID=your-app-id");
  logger.warn("VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id");
  auth = null;
}

export { 
  auth, 
  googleProvider, 
  githubProvider 
};

// Helper function to check Firebase configuration status
export const checkFirebaseConfig = () => {
  const config = {
    hasValidConfig: hasValidFirebaseConfig(),
    authInitialized: !!auth,
    providers: {
      google: !!googleProvider,
      github: !!githubProvider,
    },
    envVars: {
      apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: !!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    }
  };
  
  logger.info("Firebase Configuration Status", { config });
  return config;
};
