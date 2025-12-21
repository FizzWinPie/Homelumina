// Universal routing configuration for cross-platform compatibility
// This can be adapted for web, mobile (React Native), and desktop (Electron)

import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../layout";
import { Home } from "../pages/home";
import { Login } from "../pages/login/Login";
import { SignUp } from "../pages/sign-up/Sign-up";
import { SearchResults } from "../pages/search-results";
import { LocationDetails } from "../pages/location-details";
import { About } from "../pages/about";
import { Contact } from "../pages/contact";
import { Comparison } from "../pages/comparison";
import { ForgotPassword } from "../pages/forgot-password/ForgotPassword";

// Universal route definitions
export const universalRoutes = [
  {
    path: "/",
    element: React.createElement(Layout),
    children: [
      { index: true, element: React.createElement(Home) },
      { path: "login", element: React.createElement(Login) },
      { path: "sign-up", element: React.createElement(SignUp) },
      { path: "forgot-password", element: React.createElement(ForgotPassword) },
      { path: "search-results", element: React.createElement(SearchResults) },
      { path: "location-details", element: React.createElement(LocationDetails) },
      { path: "about", element: React.createElement(About) },
      { path: "contact", element: React.createElement(Contact) },
      { path: "comparison", element: React.createElement(Comparison) },
    ],
  },
];

// Platform detection
export const getPlatform = () => {
  if (typeof window !== 'undefined') {
    // Web browser
    return 'web';
  }
  // Can be extended for React Native, Electron, etc.
  return 'unknown';
};

// Universal router factory
export const createUniversalRouter = (platform: string = getPlatform()) => {
  switch (platform) {
    case 'web':
      // For web browsers - uses browser history
      return createBrowserRouter(universalRoutes);
    
    case 'mobile':
      // For React Native - would use react-router-native
      // import { createNativeRouter } from 'react-router-native';
      // return createNativeRouter(universalRoutes);
      throw new Error('Mobile routing not yet implemented');
    
    case 'desktop':
      // For Electron - would use hash routing or custom history
      // import { createHashRouter } from 'react-router-dom';
      // return createHashRouter(universalRoutes);
      throw new Error('Desktop routing not yet implemented');
    
    default:
      // Fallback to web router
      return createBrowserRouter(universalRoutes);
  }
}; 