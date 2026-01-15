import { useNavigate } from "react-router";
import { Star, MapPin, DollarSign, Loader2, TrendingUp, Home, Heart, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config/api";
import { logger } from "@/utils/logger";

interface FeaturedCity {
  city: string;
  state: string;
  population: string;
  avg_listing_price: string;
  avg_health_measure: string;
  price_rank: string;
  health_rank: string;
  combined_rank: string;
}

interface FeaturedLocationsProps {
  isDarkMode?: boolean;
}

export function FeaturedLocations({ isDarkMode = false }: FeaturedLocationsProps) {
  const navigate = useNavigate();
  const [featuredCities, setFeaturedCities] = useState<FeaturedCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedCities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try location-based featured cities first
        let response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/search/featured-cities/location-based`);
        
        if (!response.ok) {
          // Fallback to regular featured cities if location-based fails
          response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/search/featured-cities`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        
        const data = await response.json();
        
        if (data.success && data.data?.cities) {
          // Log the cities data to check for duplicates
          logger.debug('Featured cities data received', { 
            citiesCount: data.data.cities.length,
            cities: data.data.cities.map((city: FeaturedCity) => `${city.city}, ${city.state}`)
          });
          
          // Check for duplicates
          const cityKeys = data.data.cities.map((city: FeaturedCity) => `${city.city}-${city.state}`);
          const uniqueKeys = new Set(cityKeys);
          if (cityKeys.length !== uniqueKeys.size) {
            logger.warn('Duplicate cities detected in API response', { 
              duplicates: cityKeys.filter((key: string, index: number) => cityKeys.indexOf(key) !== index)
            });
          }
          
          // Ensure unique cities by filtering out duplicates
          const uniqueCities = data.data.cities.filter((city: FeaturedCity, index: number, self: FeaturedCity[]) => 
            index === self.findIndex(c => c.city === city.city && c.state === city.state)
          );
          
          if (uniqueCities.length !== data.data.cities.length) {
            logger.info('Filtered out duplicate cities', {
              original: data.data.cities.length,
              unique: uniqueCities.length,
              removed: data.data.cities.length - uniqueCities.length
            });
          }
          
          setFeaturedCities(uniqueCities);
          // Log if we're using location-based data
          if (data.data.userLocation) {
            if (data.data.userLocation.country === 'Non-US') {
              logger.info('Using default featured cities for non-US user', { 
                country: data.data.userLocation.country
              });
            } else {
              logger.info('Using location-based featured cities', { 
                userCity: data.data.userLocation.city, 
                userState: data.data.userLocation.state 
              });
            }
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        logger.error('Error fetching featured cities', { error: err });
        setError(err instanceof Error ? err.message : 'Failed to fetch featured cities');
        // Fallback to empty array to prevent crashes
        setFeaturedCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCities();
  }, []);

  const handleLocationClick = (city: string, state: string) => {
    navigate(`/search-results?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`);
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'N/A';
    return numPrice.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatPopulation = (population: string) => {
    const numPop = parseInt(population);
    if (isNaN(numPop)) return 'N/A';
    if (numPop >= 1000000) {
      return `${(numPop / 1000000).toFixed(1)}M`;
    } else if (numPop >= 1000) {
      return `${(numPop / 1000).toFixed(1)}K`;
    }
    return numPop.toLocaleString();
  };

  const getHealthScore = (healthMeasure: string) => {
    const healthValue = parseFloat(healthMeasure);
    if (isNaN(healthValue)) return { score: 0, label: 'N/A', color: 'gray', description: 'No data available' };
    
    // More granular health scoring algorithm for better differentiation
    // Health measures are typically obesity rates (0.0 to 1.0)
    // Lower values are better (less obesity = better health)
    let score, label, color, description;
    
    if (healthValue <= 0.15) {
      score = 10;
      label = 'Excellent';
      color = 'green';
      description = 'Exceptional health metrics - very low obesity rate';
    } else if (healthValue <= 0.20) {
      score = 9;
      label = 'Excellent';
      color = 'green';
      description = 'Outstanding health metrics - low obesity rate';
    } else if (healthValue <= 0.25) {
      score = 8;
      label = 'Very Good';
      color = 'green';
      description = 'Very good health metrics - below average obesity';
    } else if (healthValue <= 0.285) {
      score = 7;
      label = 'Good';
      color = 'blue';
      description = 'Good health metrics - average obesity rate';
    } else if (healthValue <= 0.295) {
      score = 6;
      label = 'Fair';
      color = 'yellow';
      description = 'Fair health metrics - above average obesity';
    } else if (healthValue <= 0.305) {
      score = 5;
      label = 'Average';
      color = 'yellow';
      description = 'Average health metrics - high obesity rate';
    } else if (healthValue <= 0.35) {
      score = 4;
      label = 'Below Average';
      color = 'orange';
      description = 'Below average health metrics - very high obesity';
    } else {
      score = 3;
      label = 'Poor';
      color = 'red';
      description = 'Poor health metrics - extremely high obesity rate';
    }
    
    return { score, label, color, description };
  };

  const getRankBadge = (rank: string) => {
    const rankNum = parseInt(rank);
    if (isNaN(rankNum)) return { text: 'N/A', color: 'gray', quality: 'Unknown' };
    
    if (rankNum <= 100) {
      return { text: `Top ${rankNum}`, color: 'green', quality: 'Exceptional' };
    } else if (rankNum <= 500) {
      return { text: `Top ${rankNum}`, color: 'blue', quality: 'Excellent' };
    } else if (rankNum <= 1000) {
      return { text: `Top ${rankNum}`, color: 'yellow', quality: 'Good' };
    } else {
      return { text: `#${rankNum}`, color: 'gray', quality: 'Average' };
    }
  };

  const getAffordabilityScore = (price: string, rank: string) => {
    const priceNum = parseFloat(price);
    const rankNum = parseInt(rank);
    
    if (isNaN(priceNum) || isNaN(rankNum)) return { score: 0, label: 'N/A', color: 'gray' };
    
    // Lower price and better rank = higher affordability
    const affordabilityScore = Math.max(1, Math.min(10, Math.round(10 - (priceNum / 100000) - (rankNum / 1000))));
    
    let label, color;
    if (affordabilityScore >= 8) {
      label = 'Very Affordable';
      color = 'green';
    } else if (affordabilityScore >= 6) {
      label = 'Affordable';
      color = 'blue';
    } else if (affordabilityScore >= 4) {
      label = 'Moderate';
      color = 'yellow';
    } else {
      label = 'Expensive';
      color = 'red';
    }
    
    return { score: affordabilityScore, label, color };
  };

  if (loading) {
    return (
      <section className={`py-20 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Featured Locations
            </h2>
            <div className="flex justify-center items-center">
              <Loader2 className={`h-8 w-8 animate-spin ${
                isDarkMode ? 'text-blue-300' : 'text-blue-600'
              }`} />
              <span className={`ml-3 text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Loading featured cities...
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-20 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Featured Locations
            </h2>
            <p className={`text-lg ${
              isDarkMode ? 'text-red-300' : 'text-red-600'
            }`}>
              Unable to load featured cities. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (featuredCities.length === 0) {
    return (
      <section className={`py-20 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Featured Locations
            </h2>
            <p className={`text-lg ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              No featured cities available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-20 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Featured Locations
          </h2>
          <p className={`font-accent text-lg md:text-xl max-w-3xl mx-auto font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Discover top-rated areas with exceptional quality of life and investment potential
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCities.map((city, index) => {
            // Log each city being rendered
            logger.debug('Rendering featured city', { 
              index, 
              city: city.city, 
              state: city.state 
            });
            
            const healthScore = getHealthScore(city.avg_health_measure);
            const priceRank = getRankBadge(city.price_rank);
            const healthRank = getRankBadge(city.health_rank);
            const affordability = getAffordabilityScore(city.avg_listing_price, city.price_rank);
            
            return (
              <div
                key={`${city.city}-${city.state}-${index}`}
                onClick={() => handleLocationClick(city.city, city.state)}
                className={`group relative rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border transform hover:-translate-y-3 cursor-pointer overflow-hidden ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:border-blue-600' 
                    : 'bg-white border-gray-100 hover:border-blue-200'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-gray-700 via-blue-900/20 to-gray-800' 
                    : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
                }`}></div>
                
                {/* Shimmer effect on hover */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-transparent via-blue-400/30 to-transparent' 
                    : 'bg-gradient-to-r from-transparent via-blue-200/50 to-transparent'
                }`}></div>
                
                <div className="relative z-10">
                  {/* Header with city name and population */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-transform duration-300 group-hover:scale-110 ${
                        isDarkMode 
                          ? 'bg-gradient-to-br from-blue-900 to-indigo-900 shadow-lg' 
                          : 'bg-gradient-to-br from-blue-100 to-indigo-100 shadow-md'
                      }`}>
                        <MapPin className={`h-6 w-6 ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`font-accent text-xl font-bold transition-colors ${
                          isDarkMode 
                            ? 'text-white group-hover:text-blue-300' 
                            : 'text-gray-900 group-hover:text-blue-900'
                        }`}>
                          {city.city}, {city.state}
                        </h3>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatPopulation(city.population)} residents
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className={`h-4 w-4 ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-600'
                      }`} />
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Growing
                      </span>
                    </div>
                  </div>

                  {/* Price section - Clean horizontal layout */}
                  <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Home className={`h-5 w-5 ${
                          isDarkMode ? 'text-green-300' : 'text-green-600'
                        }`} />
                        <div>
                          <span className={`font-display text-2xl font-bold ${
                            isDarkMode ? 'text-green-300' : 'text-green-600'
                          }`}>
                            {formatPrice(city.avg_listing_price)}
                          </span>
                          <span className={`ml-3 text-xs px-2 py-1 rounded-full ${
                            affordability.color === 'green' ? 'bg-green-100 text-green-800' :
                            affordability.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            affordability.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {affordability.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className={`h-4 w-4 ${
                          isDarkMode ? 'text-green-300' : 'text-green-600'
                        }`} />
                        <span className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {priceRank.quality}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Health score section - Clean horizontal layout */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Heart className={`h-5 w-5 ${
                          isDarkMode ? 'text-purple-300' : 'text-purple-600'
                        }`} />
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => {
                              const filledStars = Math.round(healthScore.score / 2);
                              return (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 transition-all duration-200 ${
                                    i < filledStars
                                      ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-500')
                                      : (isDarkMode ? 'text-gray-600' : 'text-gray-300')
                                  }`}
                                  fill={i < filledStars ? 'currentColor' : 'none'}
                                />
                              );
                            })}
                          </div>
                          <span className={`text-sm font-semibold ${
                            healthScore.color === 'green' ? (isDarkMode ? 'text-green-300' : 'text-green-600') :
                            healthScore.color === 'blue' ? (isDarkMode ? 'text-blue-300' : 'text-blue-600') :
                            healthScore.color === 'yellow' ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-600') :
                            healthScore.color === 'orange' ? (isDarkMode ? 'text-orange-300' : 'text-orange-600') :
                            healthScore.color === 'red' ? (isDarkMode ? 'text-red-300' : 'text-red-600') :
                            (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                          }`}>
                            {healthScore.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className={`h-4 w-4 ${
                          isDarkMode ? 'text-purple-300' : 'text-purple-600'
                        }`} />
                        <span className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {healthRank.quality}
                        </span>
                      </div>
                    </div>
                    <p className={`text-xs mt-2 ml-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {healthScore.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 