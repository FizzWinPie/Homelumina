import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { API_ENDPOINTS } from "@/config/api";
import { logger } from "@/utils/logger";

// Fallback suggestions in case API is unavailable
const fallbackSuggestions = [
  "New York, NY",
  "Los Angeles, CA", 
  "Chicago, IL",
  "Houston, TX",
  "Philadelphia, PA",
  "Phoenix, AZ",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "Fort Worth, TX",
  "Columbus, OH",
  "Charlotte, NC",
  "San Francisco, CA",
  "Indianapolis, IN",
  "Seattle, WA",
  "Denver, CO",
  "Washington, DC",
  "Boston, MA",
  "El Paso, TX",
  "Nashville, TN",
  "Detroit, MI",
  "Oklahoma City, OK",
  "Portland, OR",
  "Las Vegas, NV",
  "Memphis, TN",
  "Louisville, KY",
  "Baltimore, MD",
  "Milwaukee, WI",
  "Albuquerque, NM",
  "Tucson, AZ",
  "Fresno, CA",
  "Sacramento, CA",
  "Mesa, AZ",
  "Kansas City, MO",
  "Atlanta, GA",
  "Long Beach, CA",
  "Colorado Springs, CO",
  "Raleigh, NC",
  "Miami, FL",
  "Virginia Beach, VA",
  "Omaha, NE",
  "Oakland, CA",
  "Minneapolis, MN",
  "Tulsa, OK",
  "Arlington, TX",
  "Tampa, FL",
  "New Orleans, LA",
  "Wichita, KS",
  "Cleveland, OH",
  "Bakersfield, CA",
  "Aurora, CO",
  "Anaheim, CA",
  "Honolulu, HI",
  "Santa Ana, CA",
  "Corpus Christi, TX",
  "Riverside, CA",
  "Lexington, KY",
  "Stockton, CA",
  "Henderson, NV",
  "Saint Paul, MN",
  "St. Louis, MO",
  "Cincinnati, OH",
  "Pittsburgh, PA",
  "Anchorage, AK",
  "Greensboro, NC",
  "Plano, TX",
  "Newark, NJ",
  "Durham, NC",
  "Lincoln, NE",
  "Orlando, FL",
  "Chula Vista, CA",
  "Jersey City, NJ",
  "Chandler, AZ",
  "Madison, WI",
  "Lubbock, TX",
  "Scottsdale, AZ",
  "Reno, NV",
  "Buffalo, NY",
  "Gilbert, AZ",
  "Glendale, AZ",
  "North Las Vegas, NV",
  "Winston-Salem, NC",
  "Chesapeake, VA",
  "Norfolk, VA",
  "Fremont, CA",
  "Garland, TX",
  "Irving, TX",
  "Hialeah, FL",
  "Richmond, VA",
  "Boise, ID",
  "Spokane, WA",
  "Baton Rouge, LA"
].sort((a, b) => a.localeCompare(b));

interface HeroSectionProps {
  isDarkMode?: boolean;
}

export interface Suggestion {
  value: string;
  matchtype: 'City' | 'State' | 'ZipCode'
}

export function HeroSection({ isDarkMode = false }: HeroSectionProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions from API or use fallback
  const fetchSuggestions = async (term: string) => {
    if (term.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Check if the term looks like a zipcode (5 digits)
      const isZipcode = /^\d{5}$/.test(term.trim());
      // Check if the term looks like a state abbreviation (2 letters)
      const isStateAbbreviation = /^[A-Za-z]{2}$/.test(term.trim());
      // Check if the term looks like a partial zipcode (1-4 digits)
      const isPartialZipcode = /^\d{1,4}$/.test(term.trim());
      
      const limit = isStateAbbreviation ? 100 : (isZipcode || isPartialZipcode ? 20 : 10);
      
      // Try to fetch from API first
      const response = await fetch(API_ENDPOINTS.autocomplete(term, limit));
      
      if (response.ok) {
        const data = await response.json() as { success: boolean, data: { suggestions: Suggestion[] } };
        if (data.success && data.data?.suggestions) {
          // Extract the value from each suggestion
          let apiSuggestions = data.data.suggestions
          
          setSuggestions(apiSuggestions);
          setShowSuggestions(apiSuggestions.length > 0);
          setSelectedIndex(-1);
          setIsLoading(false);
          return;
        }
      } else {
        // Server error - show fallback suggestions but indicate server issue
        if (response.status >= 500) {
          setErrorMessage('Server is temporarily unavailable. Showing limited suggestions.');
        }
      }
    } catch (error) {
      logger.warn('Failed to fetch suggestions from API, using fallback', { error });
      // Fallback to basic suggestions
      setSuggestions([
        { value: 'Philadelphia, PA', matchtype: 'City' as const },
        { value: 'New York, NY', matchtype: 'City' as const },
        { value: 'Los Angeles, CA', matchtype: 'City' as const },
        { value: 'Chicago, IL', matchtype: 'City' as const },
        { value: 'Houston, TX', matchtype: 'City' as const }
      ]);
    }

    // Fallback to local filtering if API fails
    const searchLower = term.toLowerCase();
    const isStateAbbreviation = /^[A-Za-z]{2}$/.test(term.trim());
    const isZipcode = /^\d{5}$/.test(term.trim());
    const isPartialZipcode = /^\d{1,4}$/.test(term.trim());
    const maxResults = isStateAbbreviation ? 100 : (isZipcode || isPartialZipcode ? 20 : 10);
    
    let filtered = fallbackSuggestions.filter((suggestion: string) => {
      const suggestionLower = suggestion.toLowerCase();
      return suggestionLower.includes(searchLower);
    });
    
    // For state abbreviations, filter to only show cities that end with that state
    if (isStateAbbreviation) {
      const stateUpper = term.trim().toUpperCase();
      filtered = filtered.filter((suggestion: string) => 
        suggestion.endsWith(`, ${stateUpper}`)
      );
    }
    
    filtered = filtered.slice(0, maxResults);
    
    setSuggestions(filtered.map((suggestion: string) => ({ value: suggestion, matchtype: 'City' })));
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
    setIsLoading(false);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Validate search input and provide helpful error messages
  const validateSearchInput = (input: string): { isValid: boolean; error?: string; suggestion?: Suggestion } => {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      return { isValid: false, error: 'Please enter a city, state, or ZIP code to search.' };
    }
    
    if (trimmedInput.length < 2) {
      return { isValid: false, error: 'Search term must be at least 2 characters long.' };
    }
    
    // Check if it's a ZIP code
    if (/^\d{5}(-\d{4})?$/.test(trimmedInput)) {
      return { isValid: true, suggestion: { value: trimmedInput, matchtype: 'ZipCode' } };
    }
    
    // Check if it's a city, state format
    if (trimmedInput.includes(',')) {
      const parts = trimmedInput.split(',').map(part => part.trim());
      if (parts.length !== 2) {
        return { isValid: false, error: 'Please use format: City, State (e.g., New York, NY)' };
      }
      
      const [city, state] = parts;
      if (!city || city.length < 2) {
        return { isValid: false, error: 'City name must be at least 2 characters long.' };
      }
      
      if (!state || state.length !== 2) {
        return { isValid: false, error: 'State must be a 2-letter abbreviation (e.g., NY, CA, TX).' };
      }
      
      if (!/^[A-Za-z]{2}$/.test(state)) {
        return { isValid: false, error: 'State must be a 2-letter abbreviation using only letters (e.g., NY, CA, TX).' };
      }
      
      return { isValid: true, suggestion: { value: `${city}, ${state.toUpperCase()}`, matchtype: 'City' } };
    }
    
    // Check if it's a state abbreviation
    if (trimmedInput.length === 2) {
      if (!/^[A-Za-z]{2}$/.test(trimmedInput)) {
        return { isValid: false, error: 'State must be a 2-letter abbreviation using only letters (e.g., NY, CA, TX).' };
      }
      return { isValid: true, suggestion: { value: trimmedInput.toUpperCase(), matchtype: 'State' } };
    }
    
    // If we have suggestions, use the first one
    if (suggestions.length > 0) {
      return { isValid: true, suggestion: suggestions[0] };
    }
    
    // No valid format found
    return { 
      isValid: false, 
      error: 'Please enter a valid city and state (e.g., New York, NY), state abbreviation (e.g., NY), or ZIP code (e.g., 10001).' 
    };
  };

  // Handle keyboard navigation
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setErrorMessage(null); // Clear any previous errors
      
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        // If a suggestion is selected, use it
        setSearchTerm(suggestions[selectedIndex].value);
        setShowSuggestions(false);
        await handleSearch(suggestions[selectedIndex]);
      } else if (searchTerm.trim()) {
        // Validate the input
        const validation = validateSearchInput(searchTerm);
        
        if (!validation.isValid) {
          setErrorMessage(validation.error || 'Invalid input');
          return;
        }
        
        if (validation.suggestion) {
          setSearchTerm(validation.suggestion.value);
          setShowSuggestions(false);
          await handleSearch(validation.suggestion);
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setErrorMessage(null);
    }
  };

  const handleSearch = async (suggestion: Suggestion) => {
    if (suggestion.matchtype === 'ZipCode') {
      navigate(`/location-details?q=${encodeURIComponent(suggestion.value)}`);
    } else if (suggestion.matchtype === 'City') {
      const [city, state] = suggestion.value.split(', ');
      
      // Check if the search will return results before navigating
      setIsSearching(true);
      try {
        const response = await fetch(API_ENDPOINTS.zipcodeSummaries({
          city: city,
          state: state,
          healthMeasure: "Obesity among adults", // Default health measure
          minPrice: 0,
          maxPrice: 10000000,
          minIncome: 0,
          maxIncome: 10000000,
          maxHealthRatio: 1,
          minPoliceDepts: 0,
          minPoliceOfficers: 0,
          minHospitals: 0,
          minFireStations: 0,
          minFirefighters: 0,
          minChildcare: 0,
          minPopulation: 0,
          maxPopulation: 500000
        }));
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.length > 0) {
            // Has results, navigate to search-results
            navigate(`/search-results?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`);
          } else {
            // No results, show error message on home page
            setErrorMessage(`No results found for "${city}, ${state}". Please try a different location.`);
          }
        } else {
          // Server error, show error message on home page
          setErrorMessage('Unable to check search results. Please try again.');
        }
      } catch (error) {
        // Network error, show error message on home page
        setErrorMessage('Unable to connect to server. Please try again later.');
      } finally {
        setIsSearching(false);
      }
    } else if (suggestion.matchtype === 'State') {
      // For state-only searches, we can navigate directly since they should return results
      navigate(`/search-results?state=${encodeURIComponent(suggestion.value)}`);
    }
  };

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    setSearchTerm(suggestion.value);
    setShowSuggestions(false);
    setErrorMessage(null); // Clear any error messages
    await handleSearch(suggestion);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className={`relative pt-28 pb-24 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100'
    }`}>
      {/* Decorative Background Illustration */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className={`absolute top-0 left-0 w-full h-64 opacity-40 blur-sm ${
          isDarkMode ? 'opacity-20' : 'opacity-40'
        }`}>
          <defs>
            <linearGradient id="hero-bg-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isDarkMode ? "#374151" : "#a5b4fc"} />
              <stop offset="100%" stopColor={isDarkMode ? "#1f2937" : "#c7d2fe"} />
            </linearGradient>
          </defs>
          <path d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" fill="url(#hero-bg-gradient)" />
        </svg>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className={`font-display text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight tracking-tight animate-fade-in-up ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Find Your Perfect Place to {" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x drop-shadow-lg">
              Call Home
            </span>
          </h1>
          {/* Sub-headline */}
          <h3 className={`font-accent text-lg md:text-xl lg:text-2xl mb-10 max-w-4xl mx-auto font-medium leading-relaxed animate-fade-in ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <span className={`bg-clip-text text-transparent ${
              isDarkMode 
                ? 'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-100' 
                : 'bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500'
            }`}>
              Data-driven insights for smarter living decisions.
            </span>{" "}
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Discover neighborhoods that match your lifestyle and budget.
            </span>
          </h3>
          {/* Search Bar Card */}
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-3xl backdrop-blur-lg shadow-2xl border p-6 md:p-8 flex flex-col gap-4 items-center relative animate-float-up ${
              isDarkMode 
                ? 'bg-gray-800/60 border-gray-600/40' 
                : 'bg-white/60 border-blue-200/40'
            }`}>
              <div className="w-full flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 z-10 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-400'
                    }`} />
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Search by city, state, or ZIP code (e.g., Philadelphia, PA, or 19104)"
                      className={`pl-14 h-16 text-lg border-2 focus:ring-4 transition-all duration-200 shadow-lg rounded-2xl backdrop-blur-md ${
                        isDarkMode 
                          ? 'border-gray-600 focus:border-blue-400 focus:ring-blue-900/20 bg-gray-700/80 text-white placeholder-gray-400' 
                          : 'border-blue-200 focus:border-blue-500 focus:ring-blue-100 bg-white/80'
                      }`}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setErrorMessage(null); // Clear error when user types
                      }}
                      onKeyDown={handleKeyDown}
                      onFocus={() => searchTerm.trim().length > 0 && setShowSuggestions(suggestions.length > 0)}
                      disabled={isSearching}
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Error Message */}
                  {errorMessage && (
                    <div className={`mt-3 p-3 rounded-lg border-2 ${
                      isDarkMode 
                        ? 'bg-yellow-900/20 border-yellow-600/40 text-yellow-200' 
                        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    }`}>
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">Search Input Error</p>
                          <p className="mt-1">{errorMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Autocomplete Suggestions */}
                  {showSuggestions && (
                    <div
                      ref={suggestionsRef}
                      className={`absolute top-full left-0 right-0 border-2 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto mt-2 ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600' 
                          : 'bg-white border-blue-200'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center px-4 py-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading suggestions...</span>
                        </div>
                      ) : suggestions.length > 0 ? (
                        <>
                          {suggestions.length > 20 && (
                            <div className={`px-4 py-2 border-b text-xs ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-blue-300' 
                                : 'bg-blue-50 border-blue-200 text-blue-500'
                            }`}>
                              {suggestions.length === 100 ?
                                `Showing ${suggestions.length} suggestions (maximum results). Scroll to see all.` :
                                `Showing ${suggestions.length} suggestions. Scroll for more results.`
                              }
                            </div>
                          )}
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={suggestion.value}
                              className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                                index === selectedIndex 
                                  ? isDarkMode 
                                    ? 'bg-gray-700 border-l-4 border-blue-400' 
                                    : 'bg-blue-100 border-l-4 border-blue-500'
                                  : isDarkMode 
                                    ? 'hover:bg-gray-700' 
                                    : 'hover:bg-blue-50'
                              }`}
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <MapPin className={`h-4 w-4 mr-3 ${
                                isDarkMode ? 'text-blue-300' : 'text-blue-400'
                              }`} />
                              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{suggestion.value}</span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className={`px-4 py-3 ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-400'
                        }`}>
                          No suggestions found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Tagline below search bar */}
              <div className={`mt-4 text-base md:text-lg font-medium animate-fade-in ${
                isDarkMode ? 'text-blue-300/80' : 'text-blue-700/80'
              }`}>
                Start typing a city, state, or ZIP code to explore your next home.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}