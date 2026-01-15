import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Info, Stethoscope, Flame, Baby, Activity, Wind, Frown, Filter, MapPin, Award, Users, DollarSign, Home, Heart, Building2, Shield, Star, Zap, ArrowLeft } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import { useNavigate } from "react-router";
import type { ReactNode } from "react";
import { useDarkMode } from "@/providers/DarkModeProvider";
import CompareWithOtherCity from "./CompareWithOtherCity";
import { logger } from "@/utils/logger";
import { ChartLineDefault } from "@/components/PriceTrendsChart";

interface CityData {
  city: string;
  state: string;
  population?: number;
  medianIncome?: number;
  medianHomePrice?: number;
  facilities?: {
    hospitals: number;
    police: number;
    fire: number;
    childcare: number;
  };
  healthMeasures?: {
    obesity: number;
    asthma: number;
    depression: number;
  };
}

interface PriceTrendPoint {
  monthdate: string;
  medianlistingprice: number;
}

interface SimilarZipcodes {
  zipcode: string;
  similarityScore: number;
}

// Skeleton Loader Components
function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200/70 rounded ${className}`}></div>
  );
}

// Tooltip component
type TooltipProps = { text: string; children: ReactNode };
function Tooltip({ text, children }: TooltipProps) {
  return (
    <span className="relative group cursor-pointer">
      {children}
      <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 pointer-events-none whitespace-pre-line shadow-xl select-none">
        {text}
      </span>
    </span>
  );
}

// AnimatedNumber component
function AnimatedNumber({ value, className = "" }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 600;
    const initial = display;
    const diff = value - initial;
    function animate(ts: number) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplay(Math.round(initial + diff * progress));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    if (value !== display) frame = requestAnimationFrame(animate);
    return () => { if (frame) cancelAnimationFrame(frame); };
    // eslint-disable-next-line
  }, [value]);
  return <span ref={ref} className={className}>{display}</span>;
}

export function LocationDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [priceTrendData, setPriceTrendData] = useState<PriceTrendPoint[]>([]);
  const [similarZipcodes, setSimilarZipcodes] = useState<SimilarZipcodes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDarkMode } = useDarkMode();
  const [showSettings, setShowSettings] = useState(false);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);

  useEffect(() => {
    if (searchQuery) {
      fetchCityData(searchQuery);
    }
  }, [searchQuery]);

  const fetchCityData = async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if the query is a zipcode (5 digits)
      const isZipcode = /^\d{5}$/.test(query.trim());
      
      if (isZipcode) {
        // Handle zipcode search
        await fetchZipcodeData(query.trim());
        await fetchPriceTrendsData(query.trim());
        await fetchSimilarZipcodes(query.trim());
      } else {
        // Handle city/state search (existing logic)
        await fetchCityStateData(query);
      }
    } catch (error) {
      logger.error('Error fetching data:', error);
      setError('Failed to fetch city data. Please try again.');
      setLoading(false);
    }
  };

  const fetchZipcodeData = async (zipcode: string) => {
    try {
      // Fetch zipcode-specific data using the comprehensive location endpoint
      const [healthResponse, locationResponse] = await Promise.allSettled([
        fetch(API_ENDPOINTS.communityHealth(zipcode)),
        fetch(API_ENDPOINTS.zipcodeLocation(zipcode))
      ]);

      const cityData: CityData = {
        city: 'Unknown',
        state: 'Unknown',
        population: 0,
        medianIncome: 0,
        medianHomePrice: 0,
        facilities: {
          hospitals: 0,
          police: 0,
          fire: 0,
          childcare: 0
        },
        healthMeasures: {
          obesity: 0,
          asthma: 0,
          depression: 0
        }
      };

      // Process location data (includes city, state, population, real estate, income, facilities)
      if (locationResponse.status === 'fulfilled' && locationResponse.value.ok) {
        const locationData = await locationResponse.value.json();
        if (locationData.data) {
          const data = locationData.data;
          
          // Basic location info
          cityData.city = data.location?.city || 'Unknown';
          cityData.state = data.location?.state || 'Unknown';
          
          // Demographics
          cityData.population = data.demographics?.population || 0;
          
          // Real estate
          cityData.medianHomePrice = data.realEstate?.medianPrice || 0;
          
          // Income
          cityData.medianIncome = data.income?.meanIncome || 0;
          
          // Facilities
          if (data.facilities) {
            cityData.facilities = {
              hospitals: data.facilities.hospitals || 0,
              police: data.facilities.police?.stations || 0,
              fire: data.facilities.fire?.departments || 0,
              childcare: data.facilities.childcare || 0
            };
          }
        }
      } else {
        logger.error('Location response failed:', locationResponse);
      }

      // Process health data
      if (healthResponse.status === 'fulfilled' && healthResponse.value.ok) {
        const healthData = await healthResponse.value.json();
        if (healthData.data && healthData.data.length > 0) {
          const health = healthData.data[0];
          cityData.healthMeasures = {
            obesity: Math.round((health.obesityrate || 0) * 100), // Convert to percentage
            asthma: Math.round((health.asthmarate || 0) * 100),   // Convert to percentage
            depression: Math.round((health.depressionrate || 0) * 100) // Convert to percentage
          };
        }
      }

      setCityData(cityData);
      setLoading(false);
    } catch (error) {
      logger.error('Error fetching zipcode data:', error);
      setError('Failed to fetch zipcode data. Please try again.');
      setLoading(false);
    }
  };

  const fetchCityStateData = async (query: string) => {
    // Parse the query to extract city and state
    const parts = query.split(',').map(part => part.trim());
    const city = parts[0];
    const state = parts[1] || '';

    logger.debug('Fetching data for location details', { city, state });

    try {
      // Fetch city comparison data
      const cityComparisonUrl = API_ENDPOINTS.cityAggregateComparison(city, state);
      const realEstateUrl = API_ENDPOINTS.affordableZipcodes(city, state, 500000, 10);
      
      logger.debug('API URLs for location details', { cityComparisonUrl, realEstateUrl });

      const [cityComparisonData, realEstateData] = await Promise.allSettled([
        fetch(cityComparisonUrl),
        fetch(realEstateUrl)
      ]);

      const cityData: CityData = {
        city,
        state,
        population: 0,
        medianIncome: 0,
        medianHomePrice: 0,
        facilities: {
          hospitals: 0,
          police: 0,
          fire: 0,
          childcare: 0
        },
        healthMeasures: {
          obesity: 0,
          asthma: 0,
          depression: 0
        }
      };
      
      // Process city comparison data (includes population, facilities, health)
      if (cityComparisonData.status === 'fulfilled' && cityComparisonData.value.ok) {
        const comparisonData = await cityComparisonData.value.json();
        logger.debug('City comparison data received', { comparisonData });
        
        if (comparisonData.success && comparisonData.data) {
          cityData.population = comparisonData.data.totalPopulation || 0;
          cityData.medianIncome = Math.round(comparisonData.data.meanIncome || 0);
          
          // Map facilities data from server response to client structure
          cityData.facilities = {
            hospitals: comparisonData.data.numHospitals || 0,
            police: comparisonData.data.numPoliceDept || 0,
            fire: comparisonData.data.numFireDept || 0,
            childcare: comparisonData.data.numChildCareCenter || 0
          };
          
          // Map health data - server only provides obesity rate
          if (comparisonData.data.obesityRate !== null && comparisonData.data.obesityRate !== undefined) {
            cityData.healthMeasures = {
              obesity: Math.round((comparisonData.data.obesityRate || 0) * 100), // Convert to percentage
              asthma: Math.round((comparisonData.data.asthmaRate || 0) * 100), // Convert to percentage
              depression: Math.round((comparisonData.data.depressionRate || 0) * 100), // Convert to percentage
            };
          }
          
          // Process real estate data for median home price
          if (realEstateData.status === 'fulfilled' && realEstateData.value.ok) {
            const realEstate = await realEstateData.value.json();
            logger.debug('Real estate data received', { realEstate });
            
            if (realEstate.success && realEstate.data) {
              // Calculate average median listing price from all available data points
              const validPrices = realEstate.data
                .filter((item: any) => item.medianlistingprice && item.medianlistingprice > 0)
                .map((item: any) => item.medianlistingprice);
              
              if (validPrices.length > 0) {
                const averagePrice = validPrices.reduce((sum: number, price: number) => sum + price, 0) / validPrices.length;
                cityData.medianHomePrice = Math.round(averagePrice);
              }
              
              // Always try to get complete health data from the first zipcode in the city
              if (realEstate.data.length > 0) {
                const firstZipcode = realEstate.data[0].zipcode;
                try {
                  const healthResponse = await fetch(API_ENDPOINTS.communityHealth(firstZipcode));
                  
                  if (healthResponse.ok) {
                    const healthData = await healthResponse.json();
                    logger.debug('Health data from zipcode received', { healthData });
                    
                    if (healthData.success && healthData.data) {
                      const health = healthData.data[0];
                      // Use zipcode health data for asthma and depression, keep city obesity data if available
                      cityData.healthMeasures = {
                        obesity: comparisonData.data.obesityRate !== null && comparisonData.data.obesityRate !== undefined 
                          ? Math.round((comparisonData.data.obesityRate || 0) * 100) 
                          : Math.round((health.obesity || 0) * 100),
                        asthma: comparisonData.data.asthmaRate !== null && comparisonData.data.asthmaRate !== undefined 
                          ? Math.round((comparisonData.data.asthmaRate || 0) * 100) 
                          : Math.round((health.asthma || 0) * 100),
                        depression: comparisonData.data.depressionRate !== null && comparisonData.data.depressionRate !== undefined 
                          ? Math.round((comparisonData.data.depressionRate || 0) * 100) 
                          : Math.round((health.depression || 0) * 100),
                      };
                    }
                  } else {
                    logger.warn('Health response not ok', { status: healthResponse.status });
                  }
                } catch (healthError) {
                  logger.error('Error fetching health data:', healthError);
                  // Continue without health data
                }
              }
            }
          }
        } else {
          logger.warn('No data in city comparison response', { comparisonData });
        }
      } else {
        logger.error('City comparison request failed', { status: cityComparisonData.status });
      }

      // Debug real estate data
      if (realEstateData.status === 'fulfilled') {
        if (realEstateData.value.ok) {
          logger.info('Real estate request successful');
        } else {
          logger.error('Real estate request failed', { status: realEstateData.value.status, reason: realEstateData.value.statusText });
        }
      } else if (realEstateData.status === 'rejected') {
        logger.error('Real estate request rejected', { reason: realEstateData.reason });
      }

      setCityData(cityData);
      setLoading(false);
    } catch (error) {
      logger.error('Error in location details data fetch', { error, city, state });
      setError('Failed to fetch city data. Please try again.');
      setLoading(false);
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getHealthScore = () => {
    if (!cityData?.healthMeasures) return 0;
    const { obesity, asthma, depression } = cityData.healthMeasures;
    // Lower rates are better, so we invert the calculation
    const avgRate = (obesity + asthma + depression) / 3;
    return Math.max(0, 100 - avgRate);
  };

  const getAffordabilityScore = () => {
    if (!cityData?.medianIncome || !cityData?.medianHomePrice) return 0;
    // Affordability calculation: income to price ratio
    // Typical ratio: 0.1-0.3 (10-30% of home price as annual income)
    // We want higher ratios to be better (more affordable)
    const ratio = cityData.medianIncome / cityData.medianHomePrice;
    // Scale to 0-100 where 0.3+ = 100, 0.1 = 50, 0.05 = 25
    const score = Math.min(100, Math.max(0, (ratio - 0.05) * 400));
    return Math.round(score);
  };

  const getAffordabilityColors = (score: number) => {
    if (score >= 80) {
      return {
        bg: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-600',
        progressBg: 'bg-green-200',
        progressFill: 'from-green-500 to-emerald-500',
        label: 'Excellent'
      };
    } else if (score >= 60) {
      return {
        bg: 'from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        progressBg: 'bg-blue-200',
        progressFill: 'from-blue-500 to-cyan-500',
        label: 'Good'
      };
    } else if (score >= 40) {
      return {
        bg: 'from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        text: 'text-yellow-600',
        progressBg: 'bg-yellow-200',
        progressFill: 'from-yellow-500 to-amber-500',
        label: 'Moderate'
      };
    } else if (score >= 20) {
      return {
        bg: 'from-orange-50 to-red-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        progressBg: 'bg-orange-200',
        progressFill: 'from-orange-500 to-red-500',
        label: 'Poor'
      };
    } else {
      return {
        bg: 'from-red-50 to-pink-50',
        border: 'border-red-200',
        text: 'text-red-600',
        progressBg: 'bg-red-200',
        progressFill: 'from-red-500 to-pink-500',
        label: 'Very Poor'
      };
    }
  };

  const getHealthMetricColors = (rate: number) => {
    // For health metrics, lower rates are better (opposite of affordability)
    // We'll use a reverse scale where lower percentages get better colors
    if (rate <= 10) {
      return {
        bg: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-600',
        progressBg: 'bg-green-200',
        progressFill: 'from-green-500 to-emerald-500',
        label: 'Excellent',
        iconColor: 'text-green-500'
      };
    } else if (rate <= 20) {
      return {
        bg: 'from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        progressBg: 'bg-blue-200',
        progressFill: 'from-blue-500 to-cyan-500',
        label: 'Good',
        iconColor: 'text-blue-500'
      };
    } else if (rate <= 30) {
      return {
        bg: 'from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        text: 'text-yellow-600',
        progressBg: 'bg-yellow-200',
        progressFill: 'from-yellow-500 to-amber-500',
        label: 'Moderate',
        iconColor: 'text-yellow-500'
      };
    } else if (rate <= 40) {
      return {
        bg: 'from-orange-50 to-red-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        progressBg: 'bg-orange-200',
        progressFill: 'from-orange-500 to-red-500',
        label: 'Poor',
        iconColor: 'text-orange-500'
      };
    } else {
      return {
        bg: 'from-red-50 to-pink-50',
        border: 'border-red-200',
        text: 'text-red-600',
        progressBg: 'bg-red-200',
        progressFill: 'from-red-500 to-pink-500',
        label: 'Very Poor',
        iconColor: 'text-red-500'
      };
    }
  };

  const getFacilityColors = (count: number, facilityType: 'hospitals' | 'police' | 'fire' | 'childcare') => {
    // Different thresholds for different facility types based on typical needs
    let thresholds: { excellent: number; good: number; moderate: number; poor: number };
    
    switch (facilityType) {
      case 'hospitals':
        thresholds = { excellent: 3, good: 2, moderate: 1, poor: 0 };
        break;
      case 'police':
        thresholds = { excellent: 3, good: 2, moderate: 1, poor: 0 };
        break;
      case 'fire':
        thresholds = { excellent: 3, good: 2, moderate: 1, poor: 0 };
        break;
      case 'childcare':
        thresholds = { excellent: 5, good: 3, moderate: 1, poor: 0 };
        break;
      default:
        thresholds = { excellent: 3, good: 2, moderate: 1, poor: 0 };
    }

    // Special handling for zero facilities - all should be "Critical"
    if (count === 0) {
      return {
        bg: 'from-red-50 to-pink-50',
        border: 'border-red-200',
        text: 'text-red-600',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        label: 'Critical'
      };
    }

    if (count >= thresholds.excellent) {
      return {
        bg: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-600',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        label: 'Excellent'
      };
    } else if (count >= thresholds.good) {
      return {
        bg: 'from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        label: 'Good'
      };
    } else if (count >= thresholds.moderate) {
      return {
        bg: 'from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        text: 'text-yellow-600',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        label: 'Moderate'
      };
    } else {
      return {
        bg: 'from-red-50 to-pink-50',
        border: 'border-red-200',
        text: 'text-red-600',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        label: 'Poor'
      };
    }
  };

  const getHealthScoreColors = (score: number) => {
    // For health score, higher is better (opposite of individual health metrics)
    if (score >= 80) {
      return {
        bg: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-600',
        progressBg: 'bg-green-200',
        progressFill: 'from-green-500 to-emerald-500',
        label: 'Excellent'
      };
    } else if (score >= 60) {
      return {
        bg: 'from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        progressBg: 'bg-blue-200',
        progressFill: 'from-blue-500 to-cyan-500',
        label: 'Good'
      };
    } else if (score >= 40) {
      return {
        bg: 'from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        text: 'text-yellow-600',
        progressBg: 'bg-yellow-200',
        progressFill: 'from-yellow-500 to-amber-500',
        label: 'Moderate'
      };
    } else if (score >= 20) {
      return {
        bg: 'from-orange-50 to-red-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        progressBg: 'bg-orange-200',
        progressFill: 'from-orange-500 to-red-500',
        label: 'Poor'
      };
    } else {
      return {
        bg: 'from-red-50 to-pink-50',
        border: 'border-red-200',
        text: 'text-red-600',
        progressBg: 'bg-red-200',
        progressFill: 'from-red-500 to-pink-500',
        label: 'Very Poor'
      };
    }
  };

  const assessDataQuality = () => {
    const quality = {
      population: {
        available: !!cityData?.population && cityData.population > 0,
        complete: !!cityData?.population,
        label: 'Population Data',
        description: 'Demographic information'
      },
      health: {
        available: !!(cityData?.healthMeasures?.obesity || cityData?.healthMeasures?.asthma || cityData?.healthMeasures?.depression),
        complete: !!(cityData?.healthMeasures?.obesity && cityData?.healthMeasures?.asthma && cityData?.healthMeasures?.depression),
        label: 'Health Metrics',
        description: 'Health outcome data'
      },
      facilities: {
        available: !!(cityData?.facilities?.hospitals !== undefined || cityData?.facilities?.police !== undefined || cityData?.facilities?.fire !== undefined || cityData?.facilities?.childcare !== undefined),
        complete: !!(cityData?.facilities?.hospitals !== undefined && cityData?.facilities?.police !== undefined && cityData?.facilities?.fire !== undefined && cityData?.facilities?.childcare !== undefined),
        label: 'Facilities Data',
        description: 'Public service facilities'
      },
      realEstate: {
        available: !!(cityData?.medianHomePrice && cityData.medianHomePrice > 0),
        complete: !!(cityData?.medianHomePrice && cityData?.medianIncome),
        label: 'Real Estate',
        description: 'Housing and income data'
      }
    };

    // Calculate overall quality score
    const totalCategories = Object.keys(quality).length;
    const availableCategories = Object.values(quality).filter(q => q.available).length;
    const completeCategories = Object.values(quality).filter(q => q.complete).length;
    
    const overallScore = Math.round((completeCategories / totalCategories) * 100);
    const availabilityScore = Math.round((availableCategories / totalCategories) * 100);

    return { quality, overallScore, availabilityScore };
  };

  const getDataQualityColors = (score: number) => {
    if (score >= 80) {
      return {
        bg: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-600',
        dotColor: 'bg-green-500',
        label: 'Excellent'
      };
    } else if (score >= 60) {
      return {
        bg: 'from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        dotColor: 'bg-blue-500',
        label: 'Good'
      };
    } else if (score >= 40) {
      return {
        bg: 'from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        text: 'text-yellow-600',
        dotColor: 'bg-yellow-500',
        label: 'Moderate'
      };
    } else if (score >= 20) {
      return {
        bg: 'from-orange-50 to-red-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        dotColor: 'bg-orange-500',
        label: 'Poor'
      };
    } else {
      return {
        bg: 'from-red-50 to-pink-50',
        border: 'border-red-200',
        text: 'text-red-600',
        dotColor: 'bg-red-500',
        label: 'Very Poor'
      };
    }
  };

  const getLetterGrade = (score: number) => {
    if (score >= 96) {
      return "A+";
    } else if (score >= 93) {
      return "A";
    } else if (score >= 90) {
      return "A-";
    } else if (score >= 87) {
      return "B+";
    } else if (score >= 83) {
      return "B";
    } else if (score >= 80) {
      return "B-";
    } else if (score >= 77) {
      return "C+";
    } else if (score >= 73) {
      return "C";
    } else if (score >= 70) {
      return "C-";
    } else if (score >= 67) {
      return "D+";
    } else if (score >= 63) {
      return "D";
    } else if (score >= 60) {
      return "D-";
    } else {
      return "F";
    }
  };

  const fetchPriceTrendsData = async (zipcode: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.priceTrends(zipcode));
      if (!response.ok) throw new Error("Network response was bad");

      const json = await response.json();
      setPriceTrendData(json.data);
      return json;
    } catch (error) {
      console.error("Error fetching price trends:", error);
      return null;
    }
  };

  const fetchSimilarZipcodes = async (zipcode: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.similarZipcodes(zipcode));
      if (!response.ok) throw new Error("Network response was bad");

      const json = await response.json();
      setSimilarZipcodes(json.data.similarZipcodes);
      return json;
    } catch (error) {
      console.error("Error fetching price trends:", error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 via-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.1),transparent_50%)] pointer-events-none"></div>
        <div className="relative z-10">
          {/* Header Skeleton */}
          <div className="bg-gradient-to-r from-white/95 via-blue-50/95 to-indigo-50/95 backdrop-blur-xl shadow-2xl border-b border-blue-200/50 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 sm:pb-12">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center space-x-3 sm:space-x-6 min-w-0 w-full justify-center">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="min-w-0 flex-1 flex flex-col items-start justify-center">
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                </div>
                <Skeleton className="h-10 w-48 rounded-full" />
              </div>
            </div>
          </div>
          <div className="mb-8 sm:mb-12"></div>

          {/* Metrics Skeleton */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
              </div>
              {/* Sidebar Skeleton */}
              <div className="space-y-6">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <MapPin className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Unable to Load Data</h2>
            <p className="mt-2 text-red-600">{error}</p>
            <Button 
              onClick={() => fetchCityData(searchQuery)}
              className="mt-6 bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isZipcode = /^\d{5}$/.test(searchQuery.trim());
  const healthScore = getHealthScore();
  const affordabilityScore = getAffordabilityScore();
  const affordabilityColors = getAffordabilityColors(affordabilityScore);
  const affordabilityGrade = getLetterGrade(affordabilityScore);
  const healthGrade = getLetterGrade(healthScore);

  // Get health metric colors
  const obesityColors = getHealthMetricColors(cityData?.healthMeasures?.obesity || 0);
  const asthmaColors = getHealthMetricColors(cityData?.healthMeasures?.asthma || 0);
  const depressionColors = getHealthMetricColors(cityData?.healthMeasures?.depression || 0);
  
  // Get facility colors
  const hospitalColors = getFacilityColors(cityData?.facilities?.hospitals || 0, 'hospitals');
  const policeColors = getFacilityColors(cityData?.facilities?.police || 0, 'police');
  const fireColors = getFacilityColors(cityData?.facilities?.fire || 0, 'fire');
  const childcareColors = getFacilityColors(cityData?.facilities?.childcare || 0, 'childcare');
  
  // Get health score colors
  const healthScoreColors = getHealthScoreColors(healthScore);
  
  // Assess data quality
  const dataQuality = assessDataQuality();
  const dataQualityColors = getDataQualityColors(dataQuality.overallScore);

  // Section visibility toggle
  const toggleSection = (sectionId: string) => {
    setHiddenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Check if section is hidden
  const isSectionHidden = (sectionId: string) => hiddenSections.includes(sectionId);

  return (
    <div className="relative z-10">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
      {/* Header */}
      <div className={`backdrop-blur-xl shadow-2xl border-b sticky top-0 z-20 transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800/95 via-gray-700/95 to-slate-700/95 border-gray-600/50' 
          : 'bg-gradient-to-r from-white/95 via-blue-50/95 to-indigo-50/95 border-blue-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 sm:pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center space-x-3 sm:space-x-6 min-w-0 w-full justify-center">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shrink-0">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0 flex-1 flex flex-col items-start justify-center">
                <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent leading-tight pt-4 pb-2 min-h-[4rem] break-words transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-white via-blue-200 to-indigo-200' 
                    : 'bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900'
                }`}>
                  {cityData?.city && cityData?.state 
                    ? `${cityData.city}, ${cityData?.state}`
                    : loading 
                      ? 'Loading...'
                      : `ZIP Code ${searchQuery}`}
                </h1>
                <p className={`text-base sm:text-lg pb-0 font-medium transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {isZipcode ? 'ZIP Code Analysis' : 'City Overview & Statistics'}
                </p>
                
                {/* Search Information */}
                <div className={`flex items-center gap-2 mt-2 text-sm transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {isZipcode ? 'ZIP Code' : 'City/State'}:
                  </span>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {searchQuery}
                  </span>
                  {category && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Category:
                      </span>
                      <span className={`font-medium ${
                        isDarkMode ? 'text-purple-300' : 'text-purple-600'
                      }`}>
                        {category}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-end shrink-0 mt-2 sm:mt-0">
              {/* Settings Toggle */}
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="ghost"
                size="sm"
                className={`rounded-full p-2 transition-all duration-300 hover:scale-110 hidden sm:inline-flex ${
                  isDarkMode 
                    ? 'bg-gray-100/20 text-gray-300 hover:bg-gray-100/30' 
                    : 'bg-gray-100/50 text-gray-600 hover:bg-gray-100/70'
                }`}
              >
                <Filter className="h-5 w-5" />
              </Button>
              
              {category && (
                <span className="inline-flex items-center px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-xl">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                  {category}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mb-8 sm:mb-12"></div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`absolute top-24 right-4 z-30 rounded-xl shadow-2xl border transition-colors duration-500 ${
              isDarkMode 
                ? 'bg-gray-800/95 border-gray-600/50' 
                : 'bg-white/95 border-gray-200/50'
            } backdrop-blur-xl`}
          >
            <div className="p-6 w-80">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Filter className="h-5 w-5 mr-2" />
                  Filter
                </h3>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  size="sm"
                  className={`rounded-full p-1 transition-all duration-300 hover:scale-110 ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Section Visibility Controls */}
                <div className="space-y-3">
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Visible Sections
                  </span>
                  {[
                    { id: 'health-metrics', label: 'Health & Wellness Metrics' },
                    { id: 'facilities', label: 'Public Facilities & Services' },
                    { id: 'quality-life', label: 'Quality of Life Indicators' },
                    { id: 'quick-actions', label: 'Quick Actions' },
                    { id: 'search-info', label: 'Search Information' },
                    { id: 'data-quality', label: 'Data Quality' }
                  ].map((section) => (
                    <div key={section.id} className="flex items-center justify-between">
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {section.label}
                      </span>
                      <Button
                        onClick={() => toggleSection(section.id)}
                        variant="ghost"
                        size="sm"
                        className={`text-xs px-2 py-1 rounded transition-all duration-300 ${
                          isSectionHidden(section.id)
                            ? isDarkMode 
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                            : isDarkMode 
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {isSectionHidden(section.id) ? 'Show' : 'Hide'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Population */}
          <div className={`backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-6 border hover:shadow-2xl focus-within:ring-2 active:scale-[0.98] transition-all duration-200 group ${
            isDarkMode 
              ? 'bg-gray-800/90 border-gray-600/50 focus-within:ring-blue-400' 
              : 'bg-white/80 border-blue-200/50 focus-within:ring-blue-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <p className={`text-xs sm:text-sm font-medium transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-600'
                  }`}>Population</p>
                  <Tooltip text="Total number of residents in this city or ZIP code."><Info className={`h-3 w-3 sm:h-4 sm:w-4 ml-1 transition-colors duration-500 ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-400'
                  }`} /></Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <AnimatedNumber value={cityData?.population || 0} className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-600'
                  }`} />
                </div>
              </div>
              <Users className={`h-7 w-7 sm:h-8 sm:w-8 group-hover:scale-110 transition-transform ${
                isDarkMode ? 'text-blue-300' : 'text-blue-400'
              }`} />
            </div>
          </div>

          {/* Median Income */}
          <div className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-shadow duration-300 group ${
            isDarkMode 
              ? 'bg-gray-800/90 border-gray-600/50' 
              : 'bg-white/80 border-green-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <p className={`text-sm font-medium transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-600'
                  }`}>Median Income</p>
                  <Tooltip text="Median household income for this area."><Info className={`h-4 w-4 ml-1 transition-colors duration-500 ${
                    isDarkMode ? 'text-green-300' : 'text-green-400'
                  }`} /></Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                    isDarkMode ? 'text-green-300' : 'text-green-600'
                  }`}>
                    {cityData?.medianIncome && cityData.medianIncome > 0 
                      ? formatCurrency(Math.round(cityData.medianIncome))
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
              <DollarSign className={`h-8 w-8 group-hover:scale-110 transition-transform ${
                isDarkMode ? 'text-green-300' : 'text-green-400'
              }`} />
            </div>
          </div>

          {/* Home Price */}
          <div className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-shadow duration-300 group ${
            isDarkMode 
              ? 'bg-gray-800/90 border-gray-600/50' 
              : 'bg-white/80 border-purple-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <p className={`text-sm font-medium transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-600'
                  }`}>Home Price</p>
                  <Tooltip text="Median home sale price in this area."><Info className={`h-4 w-4 transition-colors duration-500 ${
                    isDarkMode ? 'text-purple-300' : 'text-purple-400'
                  }`} /></Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                    isDarkMode ? 'text-purple-300' : 'text-purple-600'
                  }`}>
                    {cityData?.medianHomePrice && cityData.medianHomePrice > 0 
                      ? formatCurrency(cityData.medianHomePrice)
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
              <Home className={`h-8 w-8 group-hover:scale-110 transition-transform ${
                isDarkMode ? 'text-purple-300' : 'text-purple-400'
              }`} />
            </div>
          </div>

          {/* Health Score */}
          <div className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-shadow duration-300 group ${
            isDarkMode 
              ? 'bg-gray-800/90 border-gray-600/50' 
              : `bg-white/80 border ${healthScoreColors.border}`
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <p className={`text-sm font-medium transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-600'
                  }`}>Health Score</p>
                  <Tooltip text="Composite score based on obesity, asthma, and depression rates (higher is better)."><Info className={`h-4 w-4 transition-colors duration-500 ${
                    isDarkMode ? healthScoreColors.text : healthScoreColors.text
                  }`} /></Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <AnimatedNumber value={Math.round(healthScore)} className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                    isDarkMode ? healthScoreColors.text : healthScoreColors.text
                  }`} />
                </div>
              </div>
              <Heart className={`h-8 w-8 group-hover:scale-110 transition-transform ${
                isDarkMode ? healthScoreColors.text : healthScoreColors.text
              }`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-h-full">
            {/* Health Statistics */}
            {!isSectionHidden('health-metrics') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gray-800/80 border-gray-600/50' 
                    : 'bg-white/80 border-red-200/50'
                }`}
              >
              <h2 className={`text-xl font-bold mb-6 flex items-center transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Heart className={`h-6 w-6 mr-3 transition-colors duration-500 ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                }`} />
                Health & Wellness Metrics
                <Tooltip text="Health outcome data including obesity, asthma, and depression rates. Lower percentages indicate better health outcomes for the community.">
                  <Info className={`h-4 w-4 ml-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-red-300' : 'text-red-400'
                  }`} />
                </Tooltip>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-600/50' 
                    : `bg-gradient-to-br ${obesityColors.bg} border ${obesityColors.border}`
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : obesityColors.progressBg
                    }`}>
                      <Activity className={`h-6 w-6 ${
                        isDarkMode ? 'text-orange-300' : obesityColors.iconColor
                      }`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDarkMode 
                        ? 'text-orange-300 bg-orange-900/30' 
                        : `${obesityColors.text} bg-opacity-20 ${obesityColors.progressBg.replace('bg-', 'bg-opacity-20 bg-')}`
                    }`}>
                      {obesityColors.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <p className={`text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-600'
                    }`}>Obesity Rate</p>
                    <Tooltip text="Percentage of adults with obesity (BMI ≥ 30). Lower rates indicate better community health outcomes.">
                      <Info className={`h-3 w-3 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                    </Tooltip>
                  </div>
                  <p className={`text-xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-orange-300' : obesityColors.text
                  }`}>
                    {cityData?.healthMeasures?.obesity || 0}%
                  </p>
                  <div className={`mt-2 w-full ${obesityColors.progressBg} rounded-full h-2 relative overflow-hidden`}>
                    <div 
                      className={`bg-gradient-to-r ${obesityColors.progressFill} h-2 rounded-full transition-all duration-500 animate-pulse`}
                      style={{ width: `${Math.min((cityData?.healthMeasures?.obesity || 0), 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-600/50' 
                    : `bg-gradient-to-br ${asthmaColors.bg} border ${asthmaColors.border}`
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : asthmaColors.progressBg
                    }`}>
                      <Wind className={`h-6 w-6 ${
                        isDarkMode ? 'text-green-300' : asthmaColors.iconColor
                      }`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDarkMode 
                        ? 'text-green-300 bg-green-900/30' 
                        : `${asthmaColors.text} bg-opacity-20 ${asthmaColors.progressBg.replace('bg-', 'bg-opacity-20 bg-')}`
                    }`}>
                      {asthmaColors.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <p className={`text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-600'
                    }`}>Asthma Rate</p>
                    <Tooltip text="Percentage of adults with asthma. Lower rates indicate better respiratory health in the community.">
                      <Info className={`h-3 w-3 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                    </Tooltip>
                  </div>
                  <p className={`text-xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-green-300' : asthmaColors.text
                  }`}>
                    {cityData?.healthMeasures?.asthma || 0}%
                  </p>
                  <div className={`mt-2 w-full ${asthmaColors.progressBg} rounded-full h-2 relative overflow-hidden`}>
                    <div 
                      className={`bg-gradient-to-r ${asthmaColors.progressFill} h-2 rounded-full transition-all duration-500 animate-pulse`}
                      style={{ width: `${Math.min((cityData?.healthMeasures?.asthma || 0), 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-600/50' 
                    : `bg-gradient-to-br ${depressionColors.bg} border ${depressionColors.border}`
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : depressionColors.progressBg
                    }`}>
                      <Frown className={`h-6 w-6 ${
                        isDarkMode ? 'text-green-300' : depressionColors.iconColor
                      }`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDarkMode 
                        ? 'text-green-300 bg-green-900/30' 
                        : `${depressionColors.text} bg-opacity-20 ${depressionColors.progressBg.replace('bg-', 'bg-opacity-20 bg-')}`
                    }`}>
                      {depressionColors.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <p className={`text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-600'
                    }`}>Depression Rate</p>
                    <Tooltip text="Percentage of adults with depression. Lower rates indicate better mental health outcomes in the community.">
                      <Info className={`h-3 w-3 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                    </Tooltip>
                  </div>
                  <p className={`text-xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-green-300' : depressionColors.text
                  }`}>
                    {cityData?.healthMeasures?.depression || 0}%
                  </p>
                  <div className={`mt-2 w-full ${depressionColors.progressBg} rounded-full h-2 relative overflow-hidden`}>
                    <div 
                      className={`bg-gradient-to-r ${depressionColors.progressFill} h-2 rounded-full transition-all duration-500 animate-pulse`}
                      style={{ width: `${Math.min((cityData?.healthMeasures?.depression || 0), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              </motion.div>
            )}

            {/* Public Facilities */}
            {!isSectionHidden('facilities') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gray-800/80 border-gray-600/50' 
                    : 'bg-white/80 border-blue-200/50'
                }`}
              >
              <h2 className={`text-xl font-bold mb-6 flex items-center transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Building2 className={`h-6 w-6 mr-3 transition-colors duration-500 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                Public Facilities & Services
                <Tooltip text="Count of essential public services including hospitals, police stations, fire departments, and childcare centers. Higher counts generally indicate better service availability.">
                  <Info className={`h-4 w-4 ml-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-400'
                  }`} />
                </Tooltip>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-600/50' 
                    : `bg-gradient-to-br ${hospitalColors.bg} border ${hospitalColors.border}`
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : hospitalColors.iconBg
                    }`}>
                      <Stethoscope className={`h-6 w-6 ${
                        isDarkMode ? 'text-red-300' : hospitalColors.iconColor
                      }`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDarkMode 
                        ? 'text-red-300 bg-red-900/30' 
                        : `${hospitalColors.text} bg-opacity-20 ${hospitalColors.iconBg.replace('bg-', 'bg-opacity-20 bg-')}`
                    }`}>
                      {hospitalColors.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <p className={`text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-600'
                    }`}>Hospitals</p>
                    <Tooltip text="Number of hospitals and medical centers providing emergency and general healthcare services.">
                      <Info className={`h-3 w-3 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                    </Tooltip>
                  </div>
                  <p className={`text-xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-red-300' : hospitalColors.text
                  }`}>{cityData?.facilities?.hospitals || 0}</p>
                </div>

                <div className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-600/50' 
                    : `bg-gradient-to-br ${policeColors.bg} border ${policeColors.border}`
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : policeColors.iconBg
                    }`}>
                      <Shield className={`h-6 w-6 ${
                        isDarkMode ? 'text-red-300' : policeColors.iconColor
                      }`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDarkMode 
                        ? 'text-red-300 bg-red-900/30' 
                        : `${policeColors.text} bg-opacity-20 ${policeColors.iconBg.replace('bg-', 'bg-opacity-20 bg-')}`
                    }`}>
                      {policeColors.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <p className={`text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-600'
                    }`}>Police Stations</p>
                    <Tooltip text="Number of police stations and law enforcement facilities providing public safety services.">
                      <Info className={`h-3 w-3 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                    </Tooltip>
                  </div>
                  <p className={`text-xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-red-300' : policeColors.text
                  }`}>{cityData?.facilities?.police || 0}</p>
                </div>

                <div className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-600/50' 
                    : `bg-gradient-to-br ${fireColors.bg} border ${fireColors.border}`
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : fireColors.iconBg
                    }`}>
                      <Flame className={`h-6 w-6 ${
                        isDarkMode ? 'text-red-300' : fireColors.iconColor
                      }`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDarkMode 
                        ? 'text-red-300 bg-red-900/30' 
                        : `${fireColors.text} bg-opacity-20 ${fireColors.iconBg.replace('bg-', 'bg-opacity-20 bg-')}`
                    }`}>
                      {fireColors.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <p className={`text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-600'
                    }`}>Fire Stations</p>
                    <Tooltip text="Number of fire departments and fire stations providing emergency fire and rescue services.">
                      <Info className={`h-3 w-3 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                    </Tooltip>
                  </div>
                  <p className={`text-xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-red-300' : fireColors.text
                  }`}>{cityData?.facilities?.fire || 0}</p>
                </div>

                <div className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-600/50' 
                    : `bg-gradient-to-br ${childcareColors.bg} border ${childcareColors.border}`
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : childcareColors.iconBg
                    }`}>
                      <Baby className={`h-6 w-6 ${
                        isDarkMode ? 'text-red-300' : childcareColors.iconColor
                      }`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDarkMode 
                        ? 'text-red-300 bg-red-900/30' 
                        : `${childcareColors.text} bg-opacity-20 ${childcareColors.iconBg.replace('bg-', 'bg-opacity-20 bg-')}`
                    }`}>
                      {childcareColors.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <p className={`text-sm font-medium transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-600'
                    }`}>Childcare Centers</p>
                    <Tooltip text="Number of licensed childcare facilities and early education centers serving families.">
                      <Info className={`h-3 w-3 transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                    </Tooltip>
                  </div>
                  <p className={`text-xl font-bold transition-colors duration-500 ${
                    isDarkMode ? 'text-red-300' : childcareColors.text
                  }`}>{cityData?.facilities?.childcare || 0}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quality of Life Indicators */}
          {!isSectionHidden('quality-life') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border transition-colors duration-500 ${
                isDarkMode 
                  ? 'bg-gray-800/80 border-gray-600/50' 
                  : 'bg-white/80 border-purple-200/50'
              }`}
            >
              <h2 className={`text-xl font-bold mb-6 flex items-center transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Star className={`h-6 w-6 mr-3 transition-colors duration-500 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
                Quality of Life Indicators
                <Tooltip text="Composite scores that combine multiple factors to assess overall quality of life. Health Grade considers obesity, asthma, and depression rates. Affordability Grade considers income-to-home-price ratio.">
                  <Info className={`h-4 w-4 ml-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-purple-300' : 'text-purple-400'
                  }`} />
                </Tooltip>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`rounded-xl p-6 border transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-600/50' 
                    : `bg-gradient-to-br ${healthScoreColors.bg} border ${healthScoreColors.border}`
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-semibold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Health Grade</h3>
                      <Tooltip text="Composite health score calculated from obesity, asthma, and depression rates. Higher grades indicate better community health outcomes.">
                        <Info className={`h-4 w-4 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-400'
                        }`} />
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-3xl font-bold transition-colors duration-500 ${
                        isDarkMode ? healthScoreColors.text : healthScoreColors.text
                      }`}>{healthGrade}</div>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full transition-colors duration-500 ${
                        isDarkMode 
                          ? `${healthScoreColors.text} bg-opacity-20 ${healthScoreColors.progressBg.replace('bg-', 'bg-opacity-20 bg-')}` 
                          : `${healthScoreColors.text} bg-opacity-20 ${healthScoreColors.progressBg.replace('bg-', 'bg-opacity-20 bg-')}`
                      }`}>
                        {healthScoreColors.label}
                      </span>
                    </div>
                  </div>
                  <div className={`w-full rounded-full h-3 mb-2 transition-colors duration-500 ${
                    isDarkMode ? healthScoreColors.progressBg : healthScoreColors.progressBg
                  }`}>
                    <div 
                      className={`bg-gradient-to-r transition-colors duration-500 ${
                        isDarkMode ? healthScoreColors.progressFill : healthScoreColors.progressFill
                      } h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${healthScore}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Based on obesity, asthma, and depression rates
                  </p>
                </div>

                <div className={`rounded-xl p-6 border transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-600/50' 
                    : `bg-gradient-to-br ${affordabilityColors.bg} border ${affordabilityColors.border}`
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-semibold transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Affordability Grade</h3>
                      <Tooltip text="Affordability measure based on median income to median home price ratio. Higher grades indicate better housing affordability for residents.">
                        <Info className={`h-4 w-4 transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-400'
                        }`} />
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-3xl font-bold transition-colors duration-500 ${
                        isDarkMode ? affordabilityColors.text : affordabilityColors.text
                      }`}>{affordabilityGrade}</div>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full transition-colors duration-500 ${
                        isDarkMode 
                          ? `${affordabilityColors.text} bg-opacity-20 ${affordabilityColors.progressBg.replace('bg-', 'bg-opacity-20 bg-')}` 
                          : `${affordabilityColors.text} bg-opacity-20 ${affordabilityColors.progressBg.replace('bg-', 'bg-opacity-20 bg-')}`
                      }`}>
                        {affordabilityColors.label}
                      </span>
                    </div>
                  </div>
                  <div className={`w-full rounded-full h-3 mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'bg-gray-700' : affordabilityColors.progressBg
                  }`}>
                    <div 
                      className={`bg-gradient-to-r transition-colors duration-500 ${
                        isDarkMode ? affordabilityColors.progressFill : affordabilityColors.progressFill
                      } h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(affordabilityScore, 100)}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Based on income to home price ratio
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6 flex flex-col justify-between flex-grow">
          {/* Quick Actions */}
          {!isSectionHidden("quick-actions") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border transition-colors duration-500 ${
                isDarkMode 
                  ? 'bg-gray-800/90 border-gray-600/50' 
                  : 'bg-white/80 border-blue-200/50'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 flex items-center transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Zap className={`h-5 w-5 mr-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <CompareWithOtherCity currentCity={cityData?.city} currentState={cityData?.state} />
                <Button 
                  variant="outline"
                  className="w-full justify-start border-2 border-gray-300 hover:border-gray-400"
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  New Search
                </Button>

                {similarZipcodes.length > 0 ? (
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Similar ZIP Codes:
                    </span>
                    <span
                      className={`text-sm font-semibold transition-colors duration-500 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {similarZipcodes
                        .map((item) => item.zipcode)
                        .join(", ")}
                    </span>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}

          {/* Market Trends */}
          <ChartLineDefault data={priceTrendData} />

          {/* Data Quality */}
          {!isSectionHidden("data-quality") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`rounded-2xl shadow-lg p-6 border transition-colors duration-500 ${
                isDarkMode 
                  ? 'bg-gray-800/90 border-gray-600/50' 
                  : `bg-gradient-to-br ${dataQualityColors.bg} border ${dataQualityColors.border}`
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold flex items-center transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Award className={`h-5 w-5 mr-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-blue-400' : dataQualityColors.text
                  }`} />
                  Data Quality
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${dataQualityColors.text}`}>{dataQuality.overallScore}%</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${dataQualityColors.text} bg-opacity-20 ${dataQualityColors.dotColor.replace('bg-', 'bg-opacity-20 bg-')}`}>
                    {dataQualityColors.label}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(dataQuality.quality).map(([key, item]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-600'
                      }`}>{item.label}</span>
                      <span className={`text-xs transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{item.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.complete ? 'bg-green-500' : item.available ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                      <span className={`text-xs transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {item.complete ? 'Complete' : item.available ? 'Partial' : 'Missing'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mt-4 pt-3 border-t transition-colors duration-500 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <div className={`flex justify-between items-center text-xs transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span>Availability: {dataQuality.availabilityScore}%</span>
                  <span>Completeness: {dataQuality.overallScore}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
  </AnimatePresence>
</div>
);
}