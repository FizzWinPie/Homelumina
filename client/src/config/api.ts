// API Configuration
// Uses environment variables for flexibility across different environments

import type { Filters } from "@/pages/search-results/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_VERSION = 'v1';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  version: API_VERSION,
  fullBaseUrl: `${API_BASE_URL}/api/${API_VERSION}`,
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.fullBaseUrl}${endpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Search endpoints
  autocomplete: (term: string, limit: number) => 
    buildApiUrl(`/search/autocomplete?term=${encodeURIComponent(term)}&limit=${limit}`),
  
  // Analytics endpoints
  cityAggregateComparison: (city: string, state: string) => 
    buildApiUrl(`/analytics/city-aggregate-comparison?city1=${encodeURIComponent(city)}&state1=${encodeURIComponent(state)}`),
  
  similarCities: (city: string, state: string) => 
    buildApiUrl(`/analytics/similar-cities/${encodeURIComponent(city)}/${encodeURIComponent(state)}`),
  
  similarZipcodes: (zipcode: string) =>
    buildApiUrl(`/analytics/similar-zipcodes/${zipcode}`),

  growthRates: (city: string, state: string) => 
    buildApiUrl(`/analytics/city-growth-rate/${encodeURIComponent(city)}/${encodeURIComponent(state)}`),

  // Real estate endpoints
  affordableZipcodes: (city: string, state: string, maxPrice: number, limit: number) => 
    buildApiUrl(`/real-estate/affordable-zipcodes?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&maxPrice=${maxPrice}&limit=${limit}`),
  
  priceTrends: (zipcode: string) => 
    buildApiUrl(`/real-estate/price-trends/${zipcode}`),

  // Health endpoints
  communityHealth: (zipcode: string) => 
    buildApiUrl(`/health/community/${zipcode}`),
  
  // Zipcode-specific endpoints
  zipcodeLocation: (zipcode: string) => 
    buildApiUrl(`/analytics/location/${zipcode}`),
  
  validateZipcode: (zipcode: string) => 
    buildApiUrl(`/analytics/validate-zipcode?zipcode=${zipcode}`),

  healthMeasures: () => buildApiUrl(`/health/measures`),

  zipcodeSummaries: (filters: Filters, limit: number = 100) => buildApiUrl(`/search/zipcode-summaries?${
    new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== null).map(([key, value]) => [key, value!.toString()]))
    ).toString()
  }&limit=${limit}`),
}; 