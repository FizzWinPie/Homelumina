import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Users,
  Star,
  Home,
  Heart,
  Shield,
  Building2,
  Target,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Stethoscope,
  Flame,
  Baby,
  Activity,
  Wind,
  Frown,
  FireExtinguisher,
  Flag,
  Moon,
  Sun,
  Settings,
  Grab,
  ArrowRight,
} from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import { useNavigate } from "react-router";
import type { ReactNode } from "react";
import { useDarkMode } from "@/providers/DarkModeProvider";
import { logger } from "@/utils/logger";

interface CityData {
  city: string;
  state: string;
  population?: number;
  medianIncome?: number;
  medianHomePrice?: number;
  growthrate3year?: string;
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

// I added this
interface SimilarData {
  city: string;
  state: string;
  similarityScore: number;
}
// added end

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
      <span className="absolute bottom-full mb-2 -translate-x-1/2 mt-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-[9999] pointer-events-none whitespace-pre-line shadow-xl select-none">
        {text}
      </span>
    </span>
  );
}

// AnimatedNumber component
function AnimatedNumber({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
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
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line
  }, [value]);
  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

export function Comparison() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("q") || "";
  //I added this to test
  const searchQuery2 = searchParams.get("r") || "";
  //Added End
  const category = searchParams.get("category") || "";

  const [cityData, setCityData] = useState<CityData | null>(null);
  //I added this to test
  const [cityData2, setCityData2] = useState<CityData | null>(null);
  const [similarList, setSimiliarList] = useState<SimilarData[]>([]);

  //Added End
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDarkMode } = useDarkMode();
  const [showSettings, setShowSettings] = useState(false);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);

  useEffect(() => {
    // I added searchQuery2
    if (searchQuery && searchQuery2) {
      fetchCityData(searchQuery, searchQuery2);
    }
  }, [searchQuery, searchQuery2]);

  // i added query2
  const fetchCityData = async (query1: string, query2: string) => {
    setLoading(true);
    setError(null);

    try {
      // Check if the query is a zipcode (5 digits)
      const isZipcode = /^\d{5}$/.test(query1.trim());

      if (isZipcode) {
        // Handle zipcode search
        await fetchZipcodeData(query1.trim());
      } else {
        // Handle city/state search (existing logic)
        await fetchCityStateData(query1, query2);
      }
    } catch (error) {
      logger.error("Error fetching data:", error);
      setError("Failed to fetch city data. Please try again.");
      setLoading(false);
    }
  };

  const fetchZipcodeData = async (zipcode: string) => {
    try {
      // Fetch zipcode-specific data using the comprehensive location endpoint
      const [healthResponse, locationResponse] = await Promise.allSettled([
        fetch(API_ENDPOINTS.communityHealth(zipcode)),
        fetch(API_ENDPOINTS.zipcodeLocation(zipcode)),
      ]);

      const cityData: CityData = {
        city: "Unknown",
        state: "Unknown",
        population: 0,
        medianIncome: 0,
        medianHomePrice: 0,
        growthrate3year: "0%",
        facilities: {
          hospitals: 0,
          police: 0,
          fire: 0,
          childcare: 0,
        },
        healthMeasures: {
          obesity: 0,
          asthma: 0,
          depression: 0,
        },
      };

      // Process location data (includes city, state, population, real estate, income, facilities)
      if (
        locationResponse.status === "fulfilled" &&
        locationResponse.value.ok
      ) {
        const locationData = await locationResponse.value.json();
        if (locationData.data) {
          const data = locationData.data;

          // Basic location info
          cityData.city = data.location?.city || "Unknown";
          cityData.state = data.location?.state || "Unknown";

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
              childcare: data.facilities.childcare || 0,
            };
          }
        }
      } else {
        logger.error("Location response failed:", locationResponse);
      }

      // Process health data
      if (healthResponse.status === "fulfilled" && healthResponse.value.ok) {
        const healthData = await healthResponse.value.json();
        if (healthData.data && healthData.data.length > 0) {
          const health = healthData.data[0];
          cityData.healthMeasures = {
            obesity: Math.round((health.obesityrate || 0) * 100), // Convert to percentage
            asthma: Math.round((health.asthmarate || 0) * 100), // Convert to percentage
            depression: Math.round((health.depressionrate || 0) * 100), // Convert to percentage
          };
        }
      }

      setCityData(cityData);
      setLoading(false);
    } catch (error) {
      logger.error("Error fetching zipcode data:", error);
      setError("Failed to fetch zipcode data. Please try again.");
      setLoading(false);
    }
  };

  // Updated This Query to use use a second query string
  const fetchCityStateData = async (query: string, query2: string) => {
    // Parse the query to extract city and state
    const parts = query.split(",").map((part) => part.trim());
    const city = parts[0];
    const state = parts[1] || "";

    // I added this
    const parts2 = query2.split(",").map((part2) => part2.trim());
    const city2 = parts2[0];
    const state2 = parts2[1] || "";
    // added end

    logger.debug("Fetching data for city comparison", { city, state });

    // Fetch city data from available endpoints
    const cityComparisonUrl = API_ENDPOINTS.cityAggregateComparison(
      city,
      state
    );
    // I added this
    const cityComparisonUrl2 = API_ENDPOINTS.cityAggregateComparison(
      city2,
      state2
    );
    const citySimilarUrl = API_ENDPOINTS.similarCities(city, state);
    const citySimilarUrl2 = API_ENDPOINTS.similarCities(city2, state2);
    const cityGrowthUrl = API_ENDPOINTS.growthRates(city, state);
    const cityGrowthUrl2 = API_ENDPOINTS.growthRates(city2, state2);

    // added end

    logger.debug("API URLs for city comparison", { cityComparisonUrl });

    //I added this
    const [
      cityComparisonData,
      cityComparisonData2,
      citySimilarData1,
      citySimilarData2,
      cityGrowthData1,
      cityGrowthData2,
    ] = await Promise.allSettled([
      fetch(cityComparisonUrl),
      // I added this
      fetch(cityComparisonUrl2),
      fetch(citySimilarUrl),
      fetch(citySimilarUrl2),
      fetch(cityGrowthUrl),
      fetch(cityGrowthUrl2),
      // added end
    ]);
    // added end

    const cityData: CityData = {
      city,
      state,
      population: 0,
      medianIncome: 0,
      medianHomePrice: 0,
      growthrate3year: "0%",
      facilities: {
        hospitals: 0,
        police: 0,
        fire: 0,
        childcare: 0,
      },
      healthMeasures: {
        obesity: 0,
        asthma: 0,
        depression: 0,
      },
    };

    // Process city 1 comparison data (includes population, facilities, health)
    if (
      cityComparisonData.status === "fulfilled" &&
      cityComparisonData.value.ok
    ) {
      const comparisonData = await cityComparisonData.value.json();
      logger.debug("City comparison data received", { comparisonData });

      if (comparisonData.success && comparisonData.data) {
        cityData.city = comparisonData.data.city;
        cityData.state = comparisonData.data.state;
        cityData.population = comparisonData.data.totalPopulation || 0;
        cityData.medianIncome = Math.round(comparisonData.data.meanIncome || 0);
        cityData.medianHomePrice = Math.round(comparisonData.data.meanHomePrice || 0);

        // Map facilities data from server response to client structure
        cityData.facilities = {
          hospitals: comparisonData.data.numHospitals || 0,
          police: comparisonData.data.numPoliceDept || 0,
          fire: comparisonData.data.numFireDept || 0,
          childcare: comparisonData.data.numChildCareCenter || 0,
        };

        // Map health data
        if (comparisonData.data.obesityRate !== null && comparisonData.data.obesityRate !== undefined) {
          cityData.healthMeasures = {
            obesity: Math.round((comparisonData.data.obesityRate || 0) * 100), // Convert to percentage
            asthma: Math.round((comparisonData.data.asthmaRate || 0) * 100), // Convert to percentage
            depression: Math.round((comparisonData.data.depressionRate || 0) * 100), // Convert to percentage
          };
        }
      } else {
        logger.warn("No data in city comparison response", { comparisonData });
      }
    } else {
      logger.error("City comparison request failed", { status: cityComparisonData.status, reason: cityComparisonData.reason });
    }

    // I am adding this entire section
    // this is getting the aggregate data for the second City
    const cityData2: CityData = {
      city,
      state,
      population: 0,
      medianIncome: 0,
      medianHomePrice: 0,
      growthrate3year: "0%",
      facilities: {
        hospitals: 0,
        police: 0,
        fire: 0,
        childcare: 0,
      },
      healthMeasures: {
        obesity: 0,
        asthma: 0,
        depression: 0,
      },
    };

    // Process city 2 comparison data (includes population, facilities, health)
    if (
      cityComparisonData2.status === "fulfilled" &&
      cityComparisonData2.value.ok
    ) {
      const comparisonData2 = await cityComparisonData2.value.json();
      logger.debug("City comparison data 2 received", { comparisonData2 });

      if (comparisonData2.success && comparisonData2.data) {
        cityData2.city = comparisonData2.data.city;
        cityData2.state = comparisonData2.data.state;
        cityData2.population = comparisonData2.data.totalPopulation || 0;
        cityData2.medianIncome = Math.round(comparisonData2.data.meanIncome || 0);
        cityData2.medianHomePrice = Math.round(comparisonData2.data.meanHomePrice || 0);

        // Map facilities data from server response to client structure
        cityData2.facilities = {
          hospitals: comparisonData2.data.numHospitals || 0,
          police: comparisonData2.data.numPoliceDept || 0,
          fire: comparisonData2.data.numFireDept || 0,
          childcare: comparisonData2.data.numChildCareCenter || 0,
        };

        // Map health data
        if (comparisonData2.data.obesityRate !== null && comparisonData2.data.obesityRate !== undefined) {
          cityData2.healthMeasures = {
            obesity: Math.round((comparisonData2.data.obesityRate || 0) * 100), // Convert to percentage
            asthma: Math.round((comparisonData2.data.asthmaRate || 0) * 100), // Convert to percentage
            depression: Math.round((comparisonData2.data.depressionRate || 0) * 100), // Convert to percentage
          };
        }
      } else {
        logger.warn("No data in city comparison response 2", { comparisonData2 });
      }
    } else {
      logger.error("City comparison request 2 failed", { status: cityComparisonData2.status, reason: cityComparisonData2.reason });
    }

    // section on getting growth rate
    let gdata: any = null;
    let gdata2: any = null;

    if (cityGrowthData1.status === "fulfilled" && cityGrowthData1.value.ok) {
      const growthData1 = await cityGrowthData1.value.json();
      logger.debug("City Growth 1 data received", { growthData1 });

      if (growthData1.success && growthData1.data) {
        gdata = growthData1.data;
        cityData.growthrate3year = gdata.growthRate3Year;
      } else {
        logger.warn("No data in city similar response 1", { growthData1 });
      }
    } else {
      logger.error("City Similar request 1 failed", { status: cityGrowthData1.status, reason: cityGrowthData1.reason });
    }

    if (cityGrowthData2.status === "fulfilled" && cityGrowthData2.value.ok) {
      const growthData2 = await cityGrowthData2.value.json();
      logger.debug("City Growth 2 data received", { growthData2 });

      if (growthData2.success && growthData2.data) {
        gdata2 = growthData2.data;
        cityData2.growthrate3year = gdata2.growthRate3Year;
      } else {
        logger.warn("No data in city Growth response 2", { growthData2 });
      }
    } else {
      logger.error("City Similar Growth 2 failed", { status: cityGrowthData2.status, reason: cityGrowthData2.reason });
    }
    // added end

    setCityData(cityData);
    // I added this
    // This is updating the state of CityData2
    // I also added the query here to collect the similar Data for the two comparison city
    setCityData2(cityData2);

    let sdata: any = null;
    let sdata2: any = null;
    if (citySimilarData1.status === "fulfilled" && citySimilarData1.value.ok) {
      const similarData1 = await citySimilarData1.value.json();
      logger.debug("City Similar 1 data received", { similarData1 });

      if (similarData1.success && similarData1.data) {
        sdata = similarData1.data;
      } else {
        logger.warn("No data in city similar response 1", { similarData1 });
      }
    } else {
      logger.error("City Similar request 1 failed", { status: citySimilarData1.status, reason: citySimilarData1.reason });
    }

    if (citySimilarData2.status === "fulfilled" && citySimilarData2.value.ok) {
      const similarData2 = await citySimilarData2.value.json();
      logger.debug("City Similar 2 data received", { similarData2 });

      if (similarData2.success && similarData2.data) {
        sdata2 = similarData2.data;
      } else {
        logger.warn("No data in city similar response 2", { similarData2 });
      }
    } else {
      logger.error("City Similar request 2 failed", { status: citySimilarData2.status, reason: citySimilarData2.reason });
    }

    if (sdata && sdata2) {
      setSimiliarList([
        sdata.similarCities[0],
        sdata.similarCities[1],
        sdata2.similarCities[0],
        sdata2.similarCities[1],
      ]);
    }
    // added end
    setLoading(false);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // I added this
  const getHealthScore = (input: CityData | null) => {
    if (!input?.healthMeasures) return 0;
    const { obesity, asthma, depression } = input.healthMeasures;
    // Lower rates are better, so we invert the calculation
    const avgRate = (obesity + asthma + depression) / 3;
    return Math.max(0, 100 - avgRate);
  };

  // Get total number of facilities
  const getTotalFacility = (input: CityData | null) => {
    if (!input?.facilities) return 0;
    const { hospitals, police, fire, childcare } = input.facilities;
    // Lower rates are better, so we invert the calculation
    const totalCount = hospitals + police + fire + childcare;
    return totalCount;
  };
  // Added End

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

  // I added this
  const getAffordabilityScoreV2 = (input: CityData | null) => {
    if (!input?.medianIncome || !input?.medianHomePrice) return 0;
    // Affordability calculation: income to price ratio
    // Typical ratio: 0.1-0.3 (10-30% of home price as annual income)
    // We want higher ratios to be better (more affordable)
    const ratio = input.medianIncome / input.medianHomePrice;
    // Scale to 0-100 where 0.3+ = 100, 0.1 = 50, 0.05 = 25
    const score = Math.min(100, Math.max(0, (ratio - 0.05) * 400));
    return Math.round(score);
  };
  // Added End

  const getAffordabilityColors = (score: number) => {
    if (score >= 80) {
      return {
        bg: "from-green-50 to-emerald-50",
        border: "border-green-200",
        text: "text-green-600",
        progressBg: "bg-green-200",
        progressFill: "from-green-500 to-emerald-500",
        label: "Excellent",
      };
    } else if (score >= 60) {
      return {
        bg: "from-blue-50 to-cyan-50",
        border: "border-blue-200",
        text: "text-blue-600",
        progressBg: "bg-blue-200",
        progressFill: "from-blue-500 to-cyan-500",
        label: "Good",
      };
    } else if (score >= 40) {
      return {
        bg: "from-yellow-50 to-amber-50",
        border: "border-yellow-200",
        text: "text-yellow-600",
        progressBg: "bg-yellow-200",
        progressFill: "from-yellow-500 to-amber-500",
        label: "Moderate",
      };
    } else if (score >= 20) {
      return {
        bg: "from-orange-50 to-red-50",
        border: "border-orange-200",
        text: "text-orange-600",
        progressBg: "bg-orange-200",
        progressFill: "from-orange-500 to-red-500",
        label: "Poor",
      };
    } else {
      return {
        bg: "from-red-50 to-pink-50",
        border: "border-red-200",
        text: "text-red-600",
        progressBg: "bg-red-200",
        progressFill: "from-red-500 to-pink-500",
        label: "Very Poor",
      };
    }
  };

  const getHealthMetricColors = (
    rate: number,
    metricType: "obesity" | "asthma" | "depression"
  ) => {
    // For health metrics, lower rates are better (opposite of affordability)
    // We'll use a reverse scale where lower percentages get better colors
    if (rate <= 10) {
      return {
        bg: "from-green-50 to-emerald-50",
        border: "border-green-200",
        text: "text-green-600",
        progressBg: "bg-green-200",
        progressFill: "from-green-500 to-emerald-500",
        label: "Excellent",
        iconColor: "text-green-500",
      };
    } else if (rate <= 20) {
      return {
        bg: "from-blue-50 to-cyan-50",
        border: "border-blue-200",
        text: "text-blue-600",
        progressBg: "bg-blue-200",
        progressFill: "from-blue-500 to-cyan-500",
        label: "Good",
        iconColor: "text-blue-500",
      };
    } else if (rate <= 30) {
      return {
        bg: "from-yellow-50 to-amber-50",
        border: "border-yellow-200",
        text: "text-yellow-600",
        progressBg: "bg-yellow-200",
        progressFill: "from-yellow-500 to-amber-500",
        label: "Moderate",
        iconColor: "text-yellow-500",
      };
    } else if (rate <= 40) {
      return {
        bg: "from-orange-50 to-red-50",
        border: "border-orange-200",
        text: "text-orange-600",
        progressBg: "bg-orange-200",
        progressFill: "from-orange-500 to-red-500",
        label: "Poor",
        iconColor: "text-orange-500",
      };
    } else {
      return {
        bg: "from-red-50 to-pink-50",
        border: "border-red-200",
        text: "text-red-600",
        progressBg: "bg-red-200",
        progressFill: "from-red-500 to-pink-500",
        label: "Very Poor",
        iconColor: "text-red-500",
      };
    }
  };

  const getFacilityColors = (
    count: number,
    facilityType: "hospitals" | "police" | "fire" | "childcare"
  ) => {
    // Different thresholds for different facility types based on typical needs
    let thresholds: {
      excellent: number;
      good: number;
      moderate: number;
      poor: number;
    };

    switch (facilityType) {
      case "hospitals":
        thresholds = { excellent: 3, good: 2, moderate: 1, poor: 0 };
        break;
      case "police":
        thresholds = { excellent: 3, good: 2, moderate: 1, poor: 0 };
        break;
      case "fire":
        thresholds = { excellent: 2, good: 1, moderate: 1, poor: 0 };
        break;
      case "childcare":
        thresholds = { excellent: 5, good: 3, moderate: 1, poor: 0 };
        break;
      default:
        thresholds = { excellent: 3, good: 2, moderate: 1, poor: 0 };
    }

    // Special handling for zero facilities - all should be "Critical"
    if (count === 0) {
      return {
        bg: "from-red-50 to-pink-50",
        border: "border-red-200",
        text: "text-red-600",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        label: "Critical",
      };
    }

    if (count >= thresholds.excellent) {
      return {
        bg: "from-green-50 to-emerald-50",
        border: "border-green-200",
        text: "text-green-600",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        label: "Excellent",
      };
    } else if (count >= thresholds.good) {
      return {
        bg: "from-blue-50 to-cyan-50",
        border: "border-blue-200",
        text: "text-blue-600",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        label: "Good",
      };
    } else if (count >= thresholds.moderate) {
      return {
        bg: "from-yellow-50 to-amber-50",
        border: "border-yellow-200",
        text: "text-yellow-600",
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
        label: "Moderate",
      };
    } else {
      return {
        bg: "from-red-50 to-pink-50",
        border: "border-red-200",
        text: "text-red-600",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        label: "Poor",
      };
    }
  };

  const getHealthScoreColors = (score: number) => {
    // For health score, higher is better (opposite of individual health metrics)
    if (score >= 80) {
      return {
        bg: "from-green-50 to-emerald-50",
        border: "border-green-200",
        text: "text-green-600",
        progressBg: "bg-green-200",
        progressFill: "from-green-500 to-emerald-500",
        label: "Excellent",
      };
    } else if (score >= 60) {
      return {
        bg: "from-blue-50 to-cyan-50",
        border: "border-blue-200",
        text: "text-blue-600",
        progressBg: "bg-blue-200",
        progressFill: "from-blue-500 to-cyan-500",
        label: "Good",
      };
    } else if (score >= 40) {
      return {
        bg: "from-yellow-50 to-amber-50",
        border: "border-yellow-200",
        text: "text-yellow-600",
        progressBg: "bg-yellow-200",
        progressFill: "from-yellow-500 to-amber-500",
        label: "Moderate",
      };
    } else if (score >= 20) {
      return {
        bg: "from-orange-50 to-red-50",
        border: "border-orange-200",
        text: "text-orange-600",
        progressBg: "bg-orange-200",
        progressFill: "from-orange-500 to-red-500",
        label: "Poor",
      };
    } else {
      return {
        bg: "from-red-50 to-pink-50",
        border: "border-red-200",
        text: "text-red-600",
        progressBg: "bg-red-200",
        progressFill: "from-red-500 to-pink-500",
        label: "Very Poor",
      };
    }
  };

  const assessDataQuality = () => {
    const quality = {
      population: {
        available: !!cityData?.population && cityData.population > 0,
        complete: !!cityData?.population,
        label: "Population Data",
        description: "Demographic information",
      },
      health: {
        available: !!(
          cityData?.healthMeasures?.obesity ||
          cityData?.healthMeasures?.asthma ||
          cityData?.healthMeasures?.depression
        ),
        complete: !!(
          cityData?.healthMeasures?.obesity &&
          cityData?.healthMeasures?.asthma &&
          cityData?.healthMeasures?.depression
        ),
        label: "Health Metrics",
        description: "Health outcome data",
      },
      facilities: {
        available: !!(
          cityData?.facilities?.hospitals !== undefined ||
          cityData?.facilities?.police !== undefined ||
          cityData?.facilities?.fire !== undefined ||
          cityData?.facilities?.childcare !== undefined
        ),
        complete: !!(
          cityData?.facilities?.hospitals !== undefined &&
          cityData?.facilities?.police !== undefined &&
          cityData?.facilities?.fire !== undefined &&
          cityData?.facilities?.childcare !== undefined
        ),
        label: "Facilities Data",
        description: "Public service facilities",
      },
      realEstate: {
        available: !!(
          cityData?.medianHomePrice && cityData.medianHomePrice > 0
        ),
        complete: !!(cityData?.medianHomePrice && cityData?.medianIncome),
        label: "Real Estate",
        description: "Housing and income data",
      },
    };

    // Calculate overall quality score
    const totalCategories = Object.keys(quality).length;
    const availableCategories = Object.values(quality).filter(
      (q) => q.available
    ).length;
    const completeCategories = Object.values(quality).filter(
      (q) => q.complete
    ).length;

    const overallScore = Math.round(
      (completeCategories / totalCategories) * 100
    );
    const availabilityScore = Math.round(
      (availableCategories / totalCategories) * 100
    );

    return { quality, overallScore, availabilityScore };
  };

  // I added this
  const assessDataQualityV2 = (input: CityData | null) => {
    const quality = {
      population: {
        available: !!input?.population && input.population > 0,
        complete: !!input?.population,
        label: "Population Data",
        description: "Demographic information",
      },
      health: {
        available: !!(
          input?.healthMeasures?.obesity ||
          input?.healthMeasures?.asthma ||
          input?.healthMeasures?.depression
        ),
        complete: !!(
          input?.healthMeasures?.obesity &&
          input?.healthMeasures?.asthma &&
          input?.healthMeasures?.depression
        ),
        label: "Health Metrics",
        description: "Health outcome data",
      },
      facilities: {
        available: !!(
          input?.facilities?.hospitals !== undefined ||
          input?.facilities?.police !== undefined ||
          input?.facilities?.fire !== undefined ||
          input?.facilities?.childcare !== undefined
        ),
        complete: !!(
          input?.facilities?.hospitals !== undefined &&
          input?.facilities?.police !== undefined &&
          input?.facilities?.fire !== undefined &&
          input?.facilities?.childcare !== undefined
        ),
        label: "Facilities Data",
        description: "Public service facilities",
      },
      realEstate: {
        available: !!(input?.medianHomePrice && input.medianHomePrice > 0),
        complete: !!(input?.medianHomePrice && input?.medianIncome),
        label: "Real Estate",
        description: "Housing and income data",
      },
    };

    // Calculate overall quality score
    const totalCategories = Object.keys(quality).length;
    const availableCategories = Object.values(quality).filter(
      (q) => q.available
    ).length;
    const completeCategories = Object.values(quality).filter(
      (q) => q.complete
    ).length;

    const overallScore = Math.round(
      (completeCategories / totalCategories) * 100
    );
    const availabilityScore = Math.round(
      (availableCategories / totalCategories) * 100
    );

    return { quality, overallScore, availabilityScore };
  };
  // Added end

  const getDataQualityColors = (score: number) => {
    if (score >= 80) {
      return {
        bg: "from-green-50 to-emerald-50",
        border: "border-green-200",
        text: "text-green-600",
        dotColor: "bg-green-500",
        label: "Excellent",
      };
    } else if (score >= 60) {
      return {
        bg: "from-blue-50 to-cyan-50",
        border: "border-blue-200",
        text: "text-blue-600",
        dotColor: "bg-blue-500",
        label: "Good",
      };
    } else if (score >= 40) {
      return {
        bg: "from-yellow-50 to-amber-50",
        border: "border-yellow-200",
        text: "text-yellow-600",
        dotColor: "bg-yellow-500",
        label: "Moderate",
      };
    } else if (score >= 20) {
      return {
        bg: "from-orange-50 to-red-50",
        border: "border-orange-200",
        text: "text-orange-600",
        dotColor: "bg-orange-500",
        label: "Poor",
      };
    } else {
      return {
        bg: "from-red-50 to-pink-50",
        border: "border-red-200",
        text: "text-red-600",
        dotColor: "bg-red-500",
        label: "Very Poor",
      };
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
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Unable to Load Data
            </h2>
            <p className="mt-2 text-red-600">{error}</p>
            <Button
              onClick={() => fetchCityData(searchQuery, searchQuery2)}
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
  const healthScore = getHealthScore(cityData);
  const affordabilityScore = getAffordabilityScore();
  const affordabilityColors = getAffordabilityColors(affordabilityScore);

  // Get health metric colors
  const obesityColors = getHealthMetricColors(
    cityData?.healthMeasures?.obesity || 0,
    "obesity"
  );
  const asthmaColors = getHealthMetricColors(
    cityData?.healthMeasures?.asthma || 0,
    "asthma"
  );
  const depressionColors = getHealthMetricColors(
    cityData?.healthMeasures?.depression || 0,
    "depression"
  );

  // Get facility colors
  const hospitalColors = getFacilityColors(
    cityData?.facilities?.hospitals || 0,
    "hospitals"
  );
  const policeColors = getFacilityColors(
    cityData?.facilities?.police || 0,
    "police"
  );
  const fireColors = getFacilityColors(cityData?.facilities?.fire || 0, "fire");
  const childcareColors = getFacilityColors(
    cityData?.facilities?.childcare || 0,
    "childcare"
  );

  // Get health score colors
  const healthScoreColors = getHealthScoreColors(healthScore);

  // Assess data quality
  const dataQuality = assessDataQuality();
  const dataQualityColors = getDataQualityColors(dataQuality.overallScore);

  // I added this for variable on city2
  const healthScore2 = getHealthScore(cityData2);
  const affordabilityScore2 = getAffordabilityScoreV2(cityData2);
  const affordabilityColors2 = getAffordabilityColors(affordabilityScore2);
  const obesityColors2 = getHealthMetricColors(
    cityData2?.healthMeasures?.obesity || 0,
    "obesity"
  );
  const asthmaColors2 = getHealthMetricColors(
    cityData2?.healthMeasures?.asthma || 0,
    "asthma"
  );
  const depressionColors2 = getHealthMetricColors(
    cityData2?.healthMeasures?.depression || 0,
    "depression"
  );
  const hospitalColors2 = getFacilityColors(
    cityData2?.facilities?.hospitals || 0,
    "hospitals"
  );
  const policeColors2 = getFacilityColors(
    cityData2?.facilities?.police || 0,
    "police"
  );
  const fireColors2 = getFacilityColors(
    cityData2?.facilities?.fire || 0,
    "fire"
  );
  const childcareColors2 = getFacilityColors(
    cityData2?.facilities?.childcare || 0,
    "childcare"
  );
  const healthScoreColors2 = getHealthScoreColors(healthScore2);
  const dataQuality2 = assessDataQualityV2(cityData2);
  const dataQualityColors2 = getDataQualityColors(dataQuality2.overallScore);

  const totalFacil1 = getTotalFacility(cityData);
  const totalFacil2 = getTotalFacility(cityData2);

  // End added

  // Section visibility toggle
  const toggleSection = (sectionId: string) => {
    setHiddenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Check if section is hidden
  const isSectionHidden = (sectionId: string) =>
    hiddenSections.includes(sectionId);

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
          <div
            className={`backdrop-blur-xl shadow-2xl border-b sticky top-0 z-20 transition-colors duration-500 ${
              isDarkMode
                ? "bg-gradient-to-r from-gray-800/95 via-gray-700/95 to-slate-700/95 border-gray-600/50"
                : "bg-gradient-to-r from-white/95 via-blue-50/95 to-indigo-50/95 border-blue-200/50"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center space-x-3 sm:space-x-6 min-w-0 w-full justify-center">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shrink-0">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col items-start justify-center">
                    <h1
                      className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent leading-tight pt-4 pb-2 min-h-[4rem] break-words transition-colors duration-500 ${
                        isDarkMode
                          ? "bg-gradient-to-r from-white via-blue-200 to-indigo-200"
                          : "bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900"
                      }`}
                    >
                      {cityData?.city &&
                      cityData?.state &&
                      cityData2?.city &&
                      cityData2?.state ? (
                        <>
                          City 1: {cityData.city}, {cityData.state}
                          <br />
                          City 2: {cityData2.city}, {cityData2.state}
                        </>
                      ) : loading ? (
                        "Loading..."
                      ) : (
                        `ZIP Code ${searchQuery}`
                      )}
                    </h1>
                    <p
                      className={`text-base sm:text-lg pb-0 font-medium transition-colors duration-500 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {isZipcode ? "ZIP Code Analysis" : "City Comparison"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-center sm:justify-end shrink-0 mt-2 sm:mt-0">
                  {/* Settings Toggle */}
                  <Button
                    onClick={() => setShowSettings(!showSettings)}
                    variant="ghost"
                    size="sm"
                    className={`rounded-full p-2 transition-all duration-300 hover:scale-110 ${
                      isDarkMode
                        ? "bg-gray-100/20 text-gray-300 hover:bg-gray-100/30"
                        : "bg-gray-100/50 text-gray-600 hover:bg-gray-100/70"
                    }`}
                  >
                    <Settings className="h-5 w-5" />
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
                    ? "bg-gray-800/95 border-gray-600/50"
                    : "bg-white/95 border-gray-200/50"
                } backdrop-blur-xl`}
              >
                <div className="p-6 w-80">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-lg font-bold flex items-center ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <Settings className="h-5 w-5 mr-2" />
                      Dashboard Settings
                    </h3>
                    <Button
                      onClick={() => setShowSettings(false)}
                      variant="ghost"
                      size="sm"
                      className={`rounded-full p-1 transition-all duration-300 hover:scale-110 ${
                        isDarkMode
                          ? "text-gray-400 hover:text-white hover:bg-gray-700"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Section Visibility Controls */}
                    <div className="space-y-3">
                      <span
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Visible Sections
                      </span>
                      {[
                        {
                          id: "health-metrics",
                          label: "Health & Wellness Metrics",
                        },
                        {
                          id: "facilities",
                          label: "Public Facilities & Services",
                        },
                        {
                          id: "quality-life",
                          label: "Quality of Life Indicators",
                        },
                        { id: "quick-actions", label: "Quick Actions" },
                        { id: "search-info", label: "Search Information" },
                        { id: "more-cities", label: "City Recommendations" },
                        { id: "data-quality", label: "Data Quality" },
                      ].map((section) => (
                        <div
                          key={section.id}
                          className="flex items-center justify-between"
                        >
                          <span
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {section.label}
                          </span>
                          <Button
                            onClick={() => toggleSection(section.id)}
                            variant="ghost"
                            size="sm"
                            className={`text-xs px-2 py-1 rounded transition-all duration-300 ${
                              isSectionHidden(section.id)
                                ? isDarkMode
                                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                  : "bg-red-100 text-red-600 hover:bg-red-200"
                                : isDarkMode
                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                : "bg-green-100 text-green-600 hover:bg-green-200"
                            }`}
                          >
                            {isSectionHidden(section.id) ? "Show" : "Hide"}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-8">
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {/* Population */}
              <div
                className={`backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-6 border hover:shadow-2xl focus-within:ring-2 active:scale-[0.98] transition-all duration-200 group ${
                  isDarkMode
                    ? "bg-gray-800/90 border-gray-600/50 focus-within:ring-blue-400"
                    : "bg-white/80 border-blue-200/50 focus-within:ring-blue-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    {/* Section Header */}
                    <div className="flex items-center gap-1 mb-1">
                      <p
                        className={`text-xs sm:text-sm font-medium transition-colors duration-500 ${
                          isDarkMode ? "text-gray-200" : "text-gray-600"
                        }`}
                      >
                        Population
                      </p>
                      <Tooltip text="Total number of residents in these cities">
                        <Info
                          className={`h-3 w-3 sm:h-4 sm:w-4 ml-1 transition-colors duration-500 ${
                            isDarkMode ? "text-blue-300" : "text-blue-400"
                          }`}
                        />
                      </Tooltip>
                    </div>

                    {/* City 1 */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        City 1:
                      </span>
                      <AnimatedNumber
                        value={cityData?.population || 0}
                        className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                          isDarkMode ? "text-blue-300" : "text-blue-600"
                        }`}
                      />
                      {cityData?.population > cityData2?.population ? (
                        <ArrowUpRight
                          className="h-5 w-5 text-green-400"
                          aria-label="Higher Population"
                        />
                      ) : cityData?.population < cityData2?.population ? (
                        <ArrowDownRight
                          className="h-5 w-5 text-red-400"
                          aria-label="Lower Population"
                        />
                      ) : null}
                    </div>

                    {/* City 2 */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        City 2:
                      </span>
                      <AnimatedNumber
                        value={cityData2?.population || 0}
                        className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                          isDarkMode ? "text-blue-300" : "text-blue-600"
                        }`}
                      />
                      {cityData2?.population > cityData?.population ? (
                        <ArrowUpRight
                          className="h-5 w-5 text-green-400"
                          aria-label="Higher Population"
                        />
                      ) : cityData2?.population < cityData?.population ? (
                        <ArrowDownRight
                          className="h-5 w-5 text-red-400"
                          aria-label="Lower Population"
                        />
                      ) : null}
                    </div>
                  </div>

                  {/* Icon */}
                  <Users
                    className={`h-12 w-12 group-hover:scale-110 transition-transform ${
                      isDarkMode ? "text-blue-300" : "text-blue-400"
                    }`}
                  />
                </div>
              </div>

              {/* Median Income */}
              <div
                className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-shadow duration-300 group ${
                  isDarkMode
                    ? "bg-gray-800/90 border-gray-600/50"
                    : "bg-white/80 border-green-200/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <p
                        className={`text-sm font-medium transition-colors duration-500 ${
                          isDarkMode ? "text-gray-200" : "text-gray-600"
                        }`}
                      >
                        Median Income
                      </p>
                      <Tooltip text="Median household income for this area.">
                        <Info
                          className={`h-4 w-4 ml-1 transition-colors duration-500 ${
                            isDarkMode ? "text-green-300" : "text-green-400"
                          }`}
                        />
                      </Tooltip>
                    </div>

                    {/* City1 Income */}
                    <div className="flex items-center gap-2">
                      {/* City label — matching population style */}
                      <span
                        className={`text-sm sm:text-base font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        City 1:
                      </span>

                      {/* Income number — matching previous bold size */}
                      <span
                        className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                          isDarkMode ? "text-green-300" : "text-green-600"
                        }`}
                      >
                        {cityData?.medianIncome && cityData.medianIncome > 0
                          ? formatCurrency(Math.round(cityData.medianIncome))
                          : "N/A"}
                      </span>

                      {/* Trend icon */}
                      {cityData?.medianIncome > cityData2?.medianIncome ? (
                        <ArrowUpRight
                          className="h-5 w-5 text-green-400"
                          aria-label="Higher Household Income"
                        />
                      ) : cityData?.medianIncome < cityData2?.medianIncome ? (
                        <ArrowDownRight
                          className="h-5 w-5 text-red-400"
                          aria-label="Lower Household Income"
                        />
                      ) : null}
                    </div>

                    {/* City2 Income */}
                    <div className="flex items-center gap-2">
                      {/* City label — matching population style */}
                      <span
                        className={`text-sm sm:text-base font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        City 2:
                      </span>

                      {/* Income number — matching previous bold size */}
                      <span
                        className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                          isDarkMode ? "text-green-300" : "text-green-600"
                        }`}
                      >
                        {cityData2?.medianIncome && cityData2.medianIncome > 0
                          ? formatCurrency(Math.round(cityData2.medianIncome))
                          : "N/A"}
                      </span>

                      {/* Trend icon */}
                      {cityData2?.medianIncome > cityData?.medianIncome ? (
                        <ArrowUpRight
                          className="h-5 w-5 text-green-400"
                          aria-label="Higher Household Income"
                        />
                      ) : cityData2?.medianIncome < cityData?.medianIncome ? (
                        <ArrowDownRight
                          className="h-5 w-5 text-red-400"
                          aria-label="Lower Household Income"
                        />
                      ) : null}
                    </div>

                    {/* Money Icon*/}
                  </div>
                  <DollarSign
                    className={`h-12 w-12 group-hover:scale-110 transition-transform ${
                      isDarkMode ? "text-green-300" : "text-green-400"
                    }`}
                  />
                </div>
              </div>

              {/* Home Price */}
              <div
                className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-shadow duration-300 group ${
                  isDarkMode
                    ? "bg-gray-800/90 border-gray-600/50"
                    : "bg-white/80 border-purple-200/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <p
                        className={`text-sm font-medium transition-colors duration-500 ${
                          isDarkMode ? "text-gray-200" : "text-gray-600"
                        }`}
                      >
                        Median Home Price
                      </p>
                      <Tooltip text="Median home sale price in this area.">
                        <Info
                          className={`h-4 w-4 transition-colors duration-500 ${
                            isDarkMode ? "text-purple-300" : "text-purple-400"
                          }`}
                        />
                      </Tooltip>
                    </div>
                    {/* City 1 Home Price*/}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        City 1:
                      </span>
                      <span
                        className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                          isDarkMode ? "text-purple-300" : "text-purple-600"
                        }`}
                      >
                        {cityData?.medianHomePrice &&
                        cityData.medianHomePrice > 0
                          ? formatCurrency(cityData.medianHomePrice)
                          : "N/A"}
                      </span>
                      {/* Example trend: up */}
                      {cityData?.medianHomePrice >
                      cityData2?.medianHomePrice ? (
                        <ArrowUpRight
                          className="h-5 w-5 text-green-400"
                          aria-label="Higher home price"
                        />
                      ) : cityData?.medianHomePrice <
                        cityData2?.medianHomePrice ? (
                        <ArrowDownRight
                          className="h-5 w-5 text-red-400"
                          aria-label="Lower home price"
                        />
                      ) : null}
                    </div>
                    {/* City 2 Home Price*/}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        City 2:
                      </span>
                      <span
                        className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                          isDarkMode ? "text-purple-300" : "text-purple-600"
                        }`}
                      >
                        {cityData2?.medianHomePrice &&
                        cityData2.medianHomePrice > 0
                          ? formatCurrency(cityData2.medianHomePrice)
                          : "N/A"}
                      </span>
                      {/* Trend logic for HomePrice */}
                      {cityData2?.medianHomePrice >
                      cityData?.medianHomePrice ? (
                        <ArrowUpRight
                          className="h-5 w-5 text-green-400"
                          aria-label="Higher home price"
                        />
                      ) : cityData2?.medianHomePrice <
                        cityData?.medianHomePrice ? (
                        <ArrowDownRight
                          className="h-5 w-5 text-red-400"
                          aria-label="Lower home price"
                        />
                      ) : null}
                    </div>
                  </div>
                  <Home
                    className={`h-12 w-12 group-hover:scale-110 transition-transform ${
                      isDarkMode ? "text-purple-300" : "text-purple-400"
                    }`}
                  />
                </div>
              </div>

              {/* Health Score */}
              <div
                className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-shadow duration-300 group ${
                  isDarkMode
                    ? "bg-gray-800/90 border-gray-600/50"
                    : "bg-white/80 border-orange-200/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <p
                        className={`text-sm font-medium transition-colors duration-500 ${
                          isDarkMode ? "text-gray-200" : "text-gray-600"
                        }`}
                      >
                        Health Score
                      </p>
                      <Tooltip text="Composite score based on obesity, asthma, and depression rates (higher is better).">
                        <Info
                          className={`h-4 w-4 transition-colors duration-500 ${
                            isDarkMode ? "text-orange-300" : "text-orange-400"
                          }`}
                        />
                      </Tooltip>
                    </div>
                    {/*City 1 Health Score*/}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        City 1:
                      </span>
                      <AnimatedNumber
                        value={Math.round(healthScore)}
                        className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                          isDarkMode ? "text-orange-300" : "text-orange-600"
                        }`}
                      />
                      {/*Trend Logic*/}
                      {healthScore > healthScore2 ? (
                        <ArrowUpRight
                          className="h-5 w-5 text-green-400"
                          aria-label="Higher Health Score"
                        />
                      ) : healthScore < healthScore2 ? (
                        <ArrowDownRight
                          className="h-5 w-5 text-red-400"
                          aria-label="Lower Health Score"
                        />
                      ) : null}
                    </div>

                    {/*City 2 Health Score*/}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        City 2:
                      </span>
                      <AnimatedNumber
                        value={Math.round(healthScore2)}
                        className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                          isDarkMode ? "text-orange-300" : "text-orange-600"
                        }`}
                      />
                      {/*Trend Logic*/}
                      {healthScore2 > healthScore ? (
                        <ArrowUpRight
                          className="h-5 w-5 text-green-400"
                          aria-label="Higher Health Score"
                        />
                      ) : healthScore2 < healthScore ? (
                        <ArrowDownRight
                          className="h-5 w-5 text-red-400"
                          aria-label="Lower Health Score"
                        />
                      ) : null}
                    </div>
                  </div>
                  <Heart
                    className={`h-12 w-12 group-hover:scale-110 transition-transform ${
                      isDarkMode ? "text-orange-300" : "text-orange-400"
                    }`}
                  />
                </div>
              </div>

              {/* TESTING STUFF */}

              {/* Home Price Growth Rate */}
              <div
                className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-shadow duration-300 group ${
                  isDarkMode
                    ? "bg-gray-800/90 border-gray-600/50"
                    : "bg-white/80 border-purple-200/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <p
                        className={`text-sm font-medium transition-colors duration-500 ${
                          isDarkMode ? "text-gray-200" : "text-gray-600"
                        }`}
                      >
                        Home Price Growth Rate
                      </p>
                      <Tooltip text="Growth rate of home price across the past 3 years">
                        <Info
                          className={`h-4 w-4 transition-colors duration-500 ${
                            isDarkMode ? "text-purple-300" : "text-purple-400"
                          }`}
                        />
                      </Tooltip>
                    </div>
                    {/* City 1 Growth Rate*/}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        City 1:
                      </span>
                      <span
                        className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                          isDarkMode ? "text-purple-300" : "text-purple-600"
                        }`}
                      >
                        {cityData?.growthrate3year &&
                        cityData.growthrate3year != "0%"
                          ? cityData.growthrate3year
                          : "N/A"}
                      </span>
                      {/* Example trend: up */}
                      {cityData?.growthrate3year &&
                      cityData.growthrate3year !== "0%" ? (
                        cityData.growthrate3year.includes("-") ? (
                          <ArrowDownRight
                            className="h-5 w-5 text-red-400"
                            aria-label="Negative growth rate"
                          />
                        ) : (
                          <ArrowUpRight
                            className="h-5 w-5 text-green-400"
                            aria-label="Positive growth rate"
                          />
                        )
                      ) : null}
                    </div>
                    {/* City 2 Home Price*/}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        City 2:
                      </span>
                      <span
                        className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                          isDarkMode ? "text-purple-300" : "text-purple-600"
                        }`}
                      >
                        {cityData2?.growthrate3year &&
                        cityData2.growthrate3year != "0%"
                          ? cityData2.growthrate3year
                          : "N/A"}
                      </span>
                      {/* Trend logic for HomePrice */}
                      {cityData2?.growthrate3year &&
                      cityData2.growthrate3year !== "0%" ? (
                        cityData2.growthrate3year.includes("-") ? (
                          <ArrowDownRight
                            className="h-5 w-5 text-red-400"
                            aria-label="Negative growth rate"
                          />
                        ) : (
                          <ArrowUpRight
                            className="h-5 w-5 text-green-400"
                            aria-label="Positive growth rate"
                          />
                        )
                      ) : null}
                    </div>
                  </div>
                  <Home
                    className={`h-12 w-12 group-hover:scale-110 transition-transform ${
                      isDarkMode ? "text-purple-300" : "text-purple-400"
                    }`}
                  />
                </div>
              </div>

              {/* Affordable ZipCode */}
              <div
                className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-shadow duration-300 group ${
                  isDarkMode
                    ? "bg-gray-800/90 border-gray-600/50"
                    : "bg-white/80 border-orange-200/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <p
                        className={`text-sm font-medium transition-colors duration-500 ${
                          isDarkMode ? "text-gray-200" : "text-gray-600"
                        }`}
                      >
                        Total Facility Count
                      </p>
                      <Tooltip text="Total count of all facilites within a city, including police station, hospitals, fire station, and childcare center">
                        <Info
                          className={`h-4 w-4 transition-colors duration-500 ${
                            isDarkMode ? "text-orange-300" : "text-orange-400"
                          }`}
                        />
                      </Tooltip>
                    </div>
                    {/*City 1 Combined Facility Count*/}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        City 1:
                      </span>
                      <AnimatedNumber
                        value={totalFacil1}
                        className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                          isDarkMode ? "text-orange-300" : "text-orange-600"
                        }`}
                      />
                      {/*Trend Logic*/}
                      {totalFacil1 > totalFacil2 ? (
                        <ArrowUpRight
                          className="h-5 w-5 text-green-400"
                          aria-label="Higher Health Score"
                        />
                      ) : totalFacil1 < totalFacil2 ? (
                        <ArrowDownRight
                          className="h-5 w-5 text-red-400"
                          aria-label="Lower Health Score"
                        />
                      ) : null}
                    </div>

                    {/*City 2 Combined Facility Count*/}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-medium transition-colors duration-200 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
                      >
                        City 2:
                      </span>
                      <AnimatedNumber
                        value={totalFacil2}
                        className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                          isDarkMode ? "text-orange-300" : "text-orange-600"
                        }`}
                      />
                      {/*Trend Logic*/}
                      {totalFacil2 > totalFacil1 ? (
                        <ArrowUpRight
                          className="h-5 w-5 text-green-400"
                          aria-label="Higher Health Score"
                        />
                      ) : totalFacil2 < totalFacil1 ? (
                        <ArrowDownRight
                          className="h-5 w-5 text-red-400"
                          aria-label="Lower Health Score"
                        />
                      ) : null}
                    </div>
                  </div>
                  <FireExtinguisher
                    className={`h-12 w-12 group-hover:scale-110 transition-transform ${
                      isDarkMode ? "text-red-300" : "text-red-400"
                    }`}
                  />
                </div>
              </div>

              {/* TESTING STUFF */}
            </div>
            {/* Summary Box: I added this for comparison purpose */}
            <div
              className={`mb-6 backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-6 border hover:shadow-2xl focus-within:ring-2 active:scale-[0.98] transition-all duration-200 group ${
                isDarkMode
                  ? "bg-gray-800/90 border-gray-600/50 focus-within:ring-blue-400"
                  : "bg-white/80 border-blue-200/50 focus-within:ring-blue-300"
              }`}
            >
              <p
                className={`text-base sm:text-lg font-semibold mb-2 transition-colors duration-200 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Summary
              </p>

              <ul
                className={`list-disc pl-5 space-y-1 transition-colors ${
                  isDarkMode ? "text-blue-100" : "text-gray-700"
                }`}
              >
                <li>
                  {cityData?.population > cityData2?.population
                    ? `${cityData.city}, ${cityData.state} has a higher population than ${cityData2.city}, ${cityData2.state}`
                    : cityData?.population < cityData2?.population
                    ? `${cityData2.city}, ${cityData2.state} has a higher population than ${cityData.city}, ${cityData.state}`
                    : `Both cities have the same population`}
                </li>
                <li>
                  {cityData?.medianIncome > cityData2?.medianIncome
                    ? `${cityData.city}, ${cityData.state} has a higher Median Household  Income than ${cityData2.city}, ${cityData2.state}`
                    : cityData?.medianIncome < cityData2?.medianIncome
                    ? `${cityData2.city}, ${cityData2.state} has a higher Median Household  Income than ${cityData.city}, ${cityData.state}`
                    : `Both cities have the same Household Income`}
                </li>
                <li>
                  {cityData?.medianHomePrice < cityData2?.medianHomePrice
                    ? `${cityData.city}, ${cityData.state} has a lower Median Home Price than ${cityData2.city}, ${cityData2.state}`
                    : cityData?.medianHomePrice > cityData2?.medianHomePrice
                    ? `${cityData2.city}, ${cityData2.state} has a higher Median Home Price than ${cityData.city}, ${cityData.state}`
                    : `Both cities have the same Household Income`}
                </li>
                <li>
                  {healthScore > healthScore2
                    ? `${cityData.city}, ${cityData.state} has a better Population Health Score than ${cityData2.city}, ${cityData2.state}`
                    : healthScore < healthScore2
                    ? `${cityData2.city}, ${cityData2.state} has a better Population Health Score than ${cityData.city}, ${cityData.state}`
                    : `Both cities have the same Household Income`}
                </li>
                <li>
                  {totalFacil1 > totalFacil2
                    ? `${cityData.city}, ${cityData.state} has more social facilites than ${cityData2.city}, ${cityData2.state}`
                    : totalFacil1 < totalFacil2
                    ? `${cityData2.city}, ${cityData2.state} has more social facilites than ${cityData.city}, ${cityData.state}`
                    : `Both cities have the same Household Income`}
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-h-full">
                {/* Health Statistics */}
                {!isSectionHidden("health-metrics") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-gray-800/80 border-gray-600/50"
                        : "bg-white/80 border-red-200/50"
                    }`}
                  >
                    <h2
                      className={`text-xl font-bold mb-6 flex items-center transition-colors duration-500 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <Heart
                        className={`h-6 w-6 mr-3 transition-colors duration-500 ${
                          isDarkMode ? "text-red-400" : "text-red-600"
                        }`}
                      />
                      Health & Wellness Metrics
                      <Tooltip text="Health outcome data including obesity, asthma, and depression rates. Lower percentages indicate better health outcomes for the community.">
                        <Info
                          className={`h-4 w-4 ml-2 transition-colors duration-500 ${
                            isDarkMode ? "text-red-300" : "text-red-400"
                          }`}
                        />
                      </Tooltip>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* This is updating the value for Obesity*/}
                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${obesityColors.bg} border ${obesityColors.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode
                                ? "bg-gray-700"
                                : obesityColors.progressBg
                            }`}
                          >
                            <Activity
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-orange-300"
                                  : obesityColors.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-orange-300 bg-orange-900/30"
                                : `${
                                    obesityColors.text
                                  } bg-opacity-20 ${obesityColors.progressBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {obesityColors.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 1 Obesity Rate
                          </p>
                          <Tooltip text="Percentage of adults with obesity (BMI ≥ 30). Lower rates indicate better community health outcomes.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode ? "text-orange-300" : obesityColors.text
                          }`}
                        >
                          {cityData?.healthMeasures?.obesity || 0}%
                        </p>
                        <div
                          className={`mt-2 w-full ${obesityColors.progressBg} rounded-full h-2 relative overflow-hidden`}
                        >
                          <div
                            className={`bg-gradient-to-r ${obesityColors.progressFill} h-2 rounded-full transition-all duration-500 animate-pulse`}
                            style={{
                              width: `${Math.min(
                                cityData?.healthMeasures?.obesity || 0,
                                100
                              )}%`,
                            }}
                          ></div>
                          <span
                            className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold ${obesityColors.text
                              .replace("text-", "text-")
                              .replace("600", "700")}`}
                          >
                            {cityData?.healthMeasures?.obesity || 0}%
                          </span>
                        </div>
                      </div>
                      {/* This is updating the value for asthma*/}
                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${asthmaColors.bg} border ${asthmaColors.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode
                                ? "bg-gray-700"
                                : asthmaColors.progressBg
                            }`}
                          >
                            <Wind
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-green-300"
                                  : asthmaColors.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-green-300 bg-green-900/30"
                                : `${
                                    asthmaColors.text
                                  } bg-opacity-20 ${asthmaColors.progressBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {asthmaColors.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 1 Asthma Rate
                          </p>
                          <Tooltip text="Percentage of adults with asthma. Lower rates indicate better respiratory health in the community.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode ? "text-green-300" : asthmaColors.text
                          }`}
                        >
                          {cityData?.healthMeasures?.asthma || 0}%
                        </p>
                        <div
                          className={`mt-2 w-full ${asthmaColors.progressBg} rounded-full h-2 relative overflow-hidden`}
                        >
                          <div
                            className={`bg-gradient-to-r ${asthmaColors.progressFill} h-2 rounded-full transition-all duration-500 animate-pulse`}
                            style={{
                              width: `${Math.min(
                                cityData?.healthMeasures?.asthma || 0,
                                100
                              )}%`,
                            }}
                          ></div>
                          <span
                            className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold ${asthmaColors.text
                              .replace("text-", "text-")
                              .replace("600", "700")}`}
                          >
                            {cityData?.healthMeasures?.asthma || 0}%
                          </span>
                        </div>
                      </div>
                      {/* This is updating the value for Depression*/}
                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${depressionColors.bg} border ${depressionColors.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode
                                ? "bg-gray-700"
                                : depressionColors.progressBg
                            }`}
                          >
                            <Frown
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-green-300"
                                  : depressionColors.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-green-300 bg-green-900/30"
                                : `${
                                    depressionColors.text
                                  } bg-opacity-20 ${depressionColors.progressBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {depressionColors.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 1 Depression Rate
                          </p>
                          <Tooltip text="Percentage of adults with depression. Lower rates indicate better mental health outcomes in the community.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode
                              ? "text-green-300"
                              : depressionColors.text
                          }`}
                        >
                          {cityData?.healthMeasures?.depression || 0}%
                        </p>
                        <div
                          className={`mt-2 w-full ${depressionColors.progressBg} rounded-full h-2 relative overflow-hidden`}
                        >
                          <div
                            className={`bg-gradient-to-r ${depressionColors.progressFill} h-2 rounded-full transition-all duration-500 animate-pulse`}
                            style={{
                              width: `${Math.min(
                                cityData?.healthMeasures?.depression || 0,
                                100
                              )}%`,
                            }}
                          ></div>
                          <span
                            className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold ${depressionColors.text
                              .replace("text-", "text-")
                              .replace("600", "700")}`}
                          >
                            {cityData?.healthMeasures?.depression || 0}%
                          </span>
                        </div>
                      </div>
                      {/*  Add more panels to show other data*/}
                      {/* This is updating the value for Obesity*/}
                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${obesityColors2.bg} border ${obesityColors2.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode
                                ? "bg-gray-700"
                                : obesityColors2.progressBg
                            }`}
                          >
                            <Activity
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-orange-300"
                                  : obesityColors2.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-orange-300 bg-orange-900/30"
                                : `${
                                    obesityColors2.text
                                  } bg-opacity-20 ${obesityColors2.progressBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {obesityColors2.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 2 Obesity Rate
                          </p>
                          <Tooltip text="Percentage of adults with obesity (BMI ≥ 30). Lower rates indicate better community health outcomes.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode ? "text-orange-300" : obesityColors2.text
                          }`}
                        >
                          {cityData2?.healthMeasures?.obesity || 0}%
                        </p>
                        <div
                          className={`mt-2 w-full ${obesityColors2.progressBg} rounded-full h-2 relative overflow-hidden`}
                        >
                          <div
                            className={`bg-gradient-to-r ${obesityColors2.progressFill} h-2 rounded-full transition-all duration-500 animate-pulse`}
                            style={{
                              width: `${Math.min(
                                cityData2?.healthMeasures?.obesity || 0,
                                100
                              )}%`,
                            }}
                          ></div>
                          <span
                            className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold ${obesityColors2.text
                              .replace("text-", "text-")
                              .replace("600", "700")}`}
                          >
                            {cityData2?.healthMeasures?.obesity || 0}%
                          </span>
                        </div>
                      </div>
                      {/* This is updating the value for asthma*/}
                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${asthmaColors2.bg} border ${asthmaColors2.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode
                                ? "bg-gray-700"
                                : asthmaColors2.progressBg
                            }`}
                          >
                            <Wind
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-green-300"
                                  : asthmaColors2.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-green-300 bg-green-900/30"
                                : `${
                                    asthmaColors2.text
                                  } bg-opacity-20 ${asthmaColors2.progressBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {asthmaColors2.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 2 Asthma Rate
                          </p>
                          <Tooltip text="Percentage of adults with asthma. Lower rates indicate better respiratory health in the community.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode ? "text-green-300" : asthmaColors2.text
                          }`}
                        >
                          {cityData2?.healthMeasures?.asthma || 0}%
                        </p>
                        <div
                          className={`mt-2 w-full ${asthmaColors2.progressBg} rounded-full h-2 relative overflow-hidden`}
                        >
                          <div
                            className={`bg-gradient-to-r ${asthmaColors2.progressFill} h-2 rounded-full transition-all duration-500 animate-pulse`}
                            style={{
                              width: `${Math.min(
                                cityData2?.healthMeasures?.asthma || 0,
                                100
                              )}%`,
                            }}
                          ></div>
                          <span
                            className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold ${asthmaColors2.text
                              .replace("text-", "text-")
                              .replace("600", "700")}`}
                          >
                            {cityData2?.healthMeasures?.asthma || 0}%
                          </span>
                        </div>
                      </div>
                      {/* This is updating the value for Depression*/}
                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${depressionColors2.bg} border ${depressionColors2.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode
                                ? "bg-gray-700"
                                : depressionColors2.progressBg
                            }`}
                          >
                            <Frown
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-green-300"
                                  : depressionColors2.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-green-300 bg-green-900/30"
                                : `${
                                    depressionColors2.text
                                  } bg-opacity-20 ${depressionColors2.progressBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {depressionColors2.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 2 Depression Rate
                          </p>
                          <Tooltip text="Percentage of adults with depression. Lower rates indicate better mental health outcomes in the community.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode
                              ? "text-green-300"
                              : depressionColors2.text
                          }`}
                        >
                          {cityData2?.healthMeasures?.depression || 0}%
                        </p>
                        <div
                          className={`mt-2 w-full ${depressionColors2.progressBg} rounded-full h-2 relative overflow-hidden`}
                        >
                          <div
                            className={`bg-gradient-to-r ${depressionColors2.progressFill} h-2 rounded-full transition-all duration-500 animate-pulse`}
                            style={{
                              width: `${Math.min(
                                cityData2?.healthMeasures?.depression || 0,
                                100
                              )}%`,
                            }}
                          ></div>
                          <span
                            className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold ${depressionColors2.text
                              .replace("text-", "text-")
                              .replace("600", "700")}`}
                          >
                            {cityData2?.healthMeasures?.depression || 0}%
                          </span>
                        </div>
                      </div>

                      {/* You can stop here for the second row*/}
                    </div>
                  </motion.div>
                )}

                {/* Public Facilities */}
                {!isSectionHidden("facilities") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-gray-800/80 border-gray-600/50"
                        : "bg-white/80 border-blue-200/50"
                    }`}
                  >
                    <h2
                      className={`text-xl font-bold mb-6 flex items-center transition-colors duration-500 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <Building2
                        className={`h-6 w-6 mr-3 transition-colors duration-500 ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      Public Facilities & Services
                      <Tooltip text="Count of essential public services including hospitals, police stations, fire departments, and childcare centers. Higher counts generally indicate better service availability.">
                        <Info
                          className={`h-4 w-4 ml-2 transition-colors duration-500 ${
                            isDarkMode ? "text-blue-300" : "text-blue-400"
                          }`}
                        />
                      </Tooltip>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${hospitalColors.bg} border ${hospitalColors.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-gray-700" : hospitalColors.iconBg
                            }`}
                          >
                            <Stethoscope
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-red-300"
                                  : hospitalColors.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-red-300 bg-red-900/30"
                                : `${
                                    hospitalColors.text
                                  } bg-opacity-20 ${hospitalColors.iconBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {hospitalColors.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 1 Hospitals
                          </p>
                          <Tooltip text="Number of hospitals and medical centers providing emergency and general healthcare services.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode ? "text-red-300" : hospitalColors.text
                          }`}
                        >
                          {cityData?.facilities?.hospitals || 0}
                        </p>
                      </div>

                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${policeColors.bg} border ${policeColors.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-gray-700" : policeColors.iconBg
                            }`}
                          >
                            <Shield
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-red-300"
                                  : policeColors.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-red-300 bg-red-900/30"
                                : `${
                                    policeColors.text
                                  } bg-opacity-20 ${policeColors.iconBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {policeColors.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 1 Police Stations
                          </p>
                          <Tooltip text="Number of police stations and law enforcement facilities providing public safety services.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode ? "text-red-300" : policeColors.text
                          }`}
                        >
                          {cityData?.facilities?.police || 0}
                        </p>
                      </div>

                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${fireColors.bg} border ${fireColors.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-gray-700" : fireColors.iconBg
                            }`}
                          >
                            <Flame
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-red-300"
                                  : fireColors.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-red-300 bg-red-900/30"
                                : `${
                                    fireColors.text
                                  } bg-opacity-20 ${fireColors.iconBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {fireColors.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 1 Fire Stations
                          </p>
                          <Tooltip text="Number of fire departments and fire stations providing emergency fire and rescue services.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode ? "text-red-300" : fireColors.text
                          }`}
                        >
                          {cityData?.facilities?.fire || 0}
                        </p>
                      </div>

                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${childcareColors.bg} border ${childcareColors.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode
                                ? "bg-gray-700"
                                : childcareColors.iconBg
                            }`}
                          >
                            <Baby
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-red-300"
                                  : childcareColors.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-red-300 bg-red-900/30"
                                : `${
                                    childcareColors.text
                                  } bg-opacity-20 ${childcareColors.iconBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {childcareColors.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 1 Childcare Centers
                          </p>
                          <Tooltip text="Number of licensed childcare facilities and early education centers serving families.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode ? "text-red-300" : childcareColors.text
                          }`}
                        >
                          {cityData?.facilities?.childcare || 0}
                        </p>
                      </div>

<div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${hospitalColors2.bg} border ${hospitalColors2.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-gray-700" : hospitalColors2.iconBg
                            }`}
                          >
                            <Stethoscope
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-red-300"
                                  : hospitalColors2.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-red-300 bg-red-900/30"
                                : `${
                                    hospitalColors.text
                                  } bg-opacity-20 ${hospitalColors2.iconBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {hospitalColors2.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 2 Hospitals
                          </p>
                          <Tooltip text="Number of hospitals and medical centers providing emergency and general healthcare services.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode ? "text-red-300" : hospitalColors2.text
                          }`}
                        >
                          {cityData2?.facilities?.hospitals || 0}
                        </p>
                      </div>

                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${policeColors2.bg} border ${policeColors2.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-gray-700" : policeColors2.iconBg
                            }`}
                          >
                            <Shield
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-red-300"
                                  : policeColors2.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-red-300 bg-red-900/30"
                                : `${
                                    policeColors2.text
                                  } bg-opacity-20 ${policeColors2.iconBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {policeColors2.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 2 Police Stations
                          </p>
                          <Tooltip text="Number of police stations and law enforcement facilities providing public safety services.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode ? "text-red-300" : policeColors2.text
                          }`}
                        >
                          {cityData2?.facilities?.police || 0}
                        </p>
                      </div>

                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${fireColors2.bg} border ${fireColors2.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode ? "bg-gray-700" : fireColors2.iconBg
                            }`}
                          >
                            <Flame
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-red-300"
                                  : fireColors2.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-red-300 bg-red-900/30"
                                : `${
                                    fireColors2.text
                                  } bg-opacity-20 ${fireColors2.iconBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {fireColors2.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 2 Fire Stations
                          </p>
                          <Tooltip text="Number of fire departments and fire stations providing emergency fire and rescue services.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode ? "text-red-300" : fireColors.text
                          }`}
                        >
                          {cityData2?.facilities?.fire || 0}
                        </p>
                      </div>

                      <div
                        className={`text-center p-4 rounded-xl border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${childcareColors2.bg} border ${childcareColors2.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode
                                ? "bg-gray-700"
                                : childcareColors2.iconBg
                            }`}
                          >
                            <Baby
                              className={`h-6 w-6 ${
                                isDarkMode
                                  ? "text-red-300"
                                  : childcareColors2.iconColor
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isDarkMode
                                ? "text-red-300 bg-red-900/30"
                                : `${
                                    childcareColors2.text
                                  } bg-opacity-20 ${childcareColors2.iconBg.replace(
                                    "bg-",
                                    "bg-opacity-20 bg-"
                                  )}`
                            }`}
                          >
                            {childcareColors2.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p
                            className={`text-sm font-medium transition-colors duration-500 ${
                              isDarkMode ? "text-gray-200" : "text-gray-600"
                            }`}
                          >
                            City 2 Childcare Centers
                          </p>
                          <Tooltip text="Number of licensed childcare facilities and early education centers serving families.">
                            <Info
                              className={`h-3 w-3 transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-400"
                              }`}
                            />
                          </Tooltip>
                        </div>
                        <p
                          className={`text-xl font-bold transition-colors duration-500 ${
                            isDarkMode ? "text-red-300" : childcareColors2.text
                          }`}
                        >
                          {cityData2?.facilities?.childcare || 0}
                        </p>
                      </div>



                    </div>
                  </motion.div>
                )}

                {/* Quality of Life Indicators */}
                {!isSectionHidden("quality-life") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-gray-800/80 border-gray-600/50"
                        : "bg-white/80 border-purple-200/50"
                    }`}
                  >
                    <h2
                      className={`text-xl font-bold mb-6 flex items-center transition-colors duration-500 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <Star
                        className={`h-6 w-6 mr-3 transition-colors duration-500 ${
                          isDarkMode ? "text-purple-400" : "text-purple-600"
                        }`}
                      />
                      Quality of Life Indicators
                      <Tooltip text="Composite scores that combine multiple factors to assess overall quality of life. Health Score considers obesity, asthma, and depression rates. Affordability Score considers income-to-home-price ratio.">
                        <Info
                          className={`h-4 w-4 ml-2 transition-colors duration-500 ${
                            isDarkMode ? "text-purple-300" : "text-purple-400"
                          }`}
                        />
                      </Tooltip>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* City 1 Affordability Score Section*/}
                      <div
                        className={`rounded-xl p-6 border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${affordabilityColors.bg} border ${affordabilityColors.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-lg font-semibold transition-colors duration-500 ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              City 1 Affordability Score
                            </h3>
                            <Tooltip text="Affordability measure based on median income to median home price ratio. Higher scores indicate better housing affordability for residents.">
                              <Info
                                className={`h-4 w-4 transition-colors duration-500 ${
                                  isDarkMode ? "text-gray-400" : "text-gray-400"
                                }`}
                              />
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`text-3xl font-bold transition-colors duration-500 ${
                                isDarkMode
                                  ? "text-green-300"
                                  : affordabilityColors.text
                              }`}
                            >
                              {Math.round(affordabilityScore)}%
                            </div>
                            <span
                              className={`text-sm font-medium px-2 py-1 rounded-full transition-colors duration-500 ${
                                isDarkMode
                                  ? "text-green-300 bg-green-900/30"
                                  : `${
                                      affordabilityColors.text
                                    } bg-opacity-20 ${affordabilityColors.progressBg.replace(
                                      "bg-",
                                      "bg-opacity-20 bg-"
                                    )}`
                              }`}
                            >
                              {affordabilityColors.label}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-full rounded-full h-3 mb-2 transition-colors duration-500 ${
                            isDarkMode
                              ? "bg-gray-700"
                              : affordabilityColors.progressBg
                          }`}
                        >
                          <div
                            className={`bg-gradient-to-r transition-colors duration-500 ${
                              isDarkMode
                                ? "from-green-500 to-green-600"
                                : affordabilityColors.progressFill
                            } h-3 rounded-full transition-all duration-500`}
                            style={{
                              width: `${Math.min(affordabilityScore, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <p
                          className={`text-sm transition-colors duration-500 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Based on income to home price ratio
                        </p>
                      </div>
                      {/* This is where you can add more panels*/}

                      {/* City 2 Affordability Score Section*/}
                      <div
                        className={`rounded-xl p-6 border transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/90 border-gray-600/50"
                            : `bg-gradient-to-br ${affordabilityColors2.bg} border ${affordabilityColors2.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-lg font-semibold transition-colors duration-500 ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              City 2 Affordability Score
                            </h3>
                            <Tooltip text="Affordability measure based on median income to median home price ratio. Higher scores indicate better housing affordability for residents.">
                              <Info
                                className={`h-4 w-4 transition-colors duration-500 ${
                                  isDarkMode ? "text-gray-400" : "text-gray-400"
                                }`}
                              />
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`text-3xl font-bold transition-colors duration-500 ${
                                isDarkMode
                                  ? "text-green-300"
                                  : affordabilityColors2.text
                              }`}
                            >
                              {Math.round(affordabilityScore2)}%
                            </div>
                            <span
                              className={`text-sm font-medium px-2 py-1 rounded-full transition-colors duration-500 ${
                                isDarkMode
                                  ? "text-green-300 bg-green-900/30"
                                  : `${
                                      affordabilityColors2.text
                                    } bg-opacity-20 ${affordabilityColors2.progressBg.replace(
                                      "bg-",
                                      "bg-opacity-20 bg-"
                                    )}`
                              }`}
                            >
                              {affordabilityColors2.label}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-full rounded-full h-3 mb-2 transition-colors duration-500 ${
                            isDarkMode
                              ? "bg-gray-700"
                              : affordabilityColors2.progressBg
                          }`}
                        >
                          <div
                            className={`bg-gradient-to-r transition-colors duration-500 ${
                              isDarkMode
                                ? "from-green-500 to-green-600"
                                : affordabilityColors2.progressFill
                            } h-3 rounded-full transition-all duration-500`}
                            style={{
                              width: `${Math.min(affordabilityScore2, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <p
                          className={`text-sm transition-colors duration-500 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
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
                        ? "bg-gray-800/90 border-gray-600/50"
                        : "bg-white/80 border-blue-200/50"
                    }`}
                  >
                    <h3
                      className={`text-lg font-bold mb-4 flex items-center transition-colors duration-500 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <Zap
                        className={`h-5 w-5 mr-2 transition-colors duration-500 ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-2 border-gray-300 hover:border-gray-400"
                        onClick={() => navigate("/")}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        New Search
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* You Might be Interested in the followiny City */}
                {!isSectionHidden("more-cities") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`backdrop-blur-lg rounded-2xl shadow-lg p-6 border transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-gray-800/90 border-gray-600/50"
                        : "bg-white/80 border-blue-200/50"
                    }`}
                  >
                    <h3
                      className={`text-lg font-bold mb-4 flex items-center transition-colors duration-500 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <Flag
                        className={`h-5 w-5 mr-2 transition-colors duration-500 ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      More cities like {cityData?.city}, {cityData?.state}?
                    </h3>
                    <div className="space-y-3">
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        onClick={() =>
                          navigate(
                            `/location-details?q=${encodeURIComponent(
                              similarList[0]?.city || ""
                            )}%2C${encodeURIComponent(
                              similarList[0]?.state || ""
                            )}`
                          )
                        }
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {similarList[0]?.city}, {similarList[0]?.state}
                      </Button>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        onClick={() =>
                          navigate(
                            `/location-details?q=${encodeURIComponent(
                              similarList[1]?.city || ""
                            )}%2C${encodeURIComponent(
                              similarList[1]?.state || ""
                            )}`
                          )
                        }
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {similarList[1]?.city}, {similarList[1]?.state}
                      </Button>
                      <h3
                        className={`text-lg font-bold mb-4 flex items-center transition-colors duration-500 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <Flag
                          className={`h-5 w-5 mr-2 transition-colors duration-500 ${
                            isDarkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                        More cities like {cityData2?.city}, {cityData2?.state}?
                      </h3>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        onClick={() =>
                          navigate(
                            `/location-details?q=${encodeURIComponent(
                              similarList[2]?.city || ""
                            )}%2C${encodeURIComponent(
                              similarList[2]?.state || ""
                            )}`
                          )
                        }
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {similarList[2]?.city}, {similarList[2]?.state}
                      </Button>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        onClick={() =>
                          navigate(
                            `/location-details?q=${encodeURIComponent(
                              similarList[3]?.city || ""
                            )}%2C${encodeURIComponent(
                              similarList[3]?.state || ""
                            )}`
                          )
                        }
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {similarList[3]?.city}, {similarList[3]?.state}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Search Type Info */}
                {!isSectionHidden("search-info") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`rounded-2xl shadow-lg p-6 border transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-gray-800/90 border-gray-600/50"
                        : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50"
                    }`}
                  >
                    <h3
                      className={`text-lg font-bold mb-4 flex items-center transition-colors duration-500 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <MapPin
                        className={`h-5 w-5 mr-2 transition-colors duration-500 ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      Search Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-sm transition-colors duration-500 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Search Type:
                        </span>
                        <span
                          className={`text-sm font-semibold transition-colors duration-500 ${
                            isDarkMode ? "text-blue-300" : "text-blue-600"
                          }`}
                        >
                          {"City/State"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-sm transition-colors duration-500 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Query:
                        </span>
                        <span
                          className={`text-sm font-semibold transition-colors duration-500 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {searchQuery} & {searchQuery2}
                        </span>
                      </div>
                      {category && (
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-sm transition-colors duration-500 ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            Category:
                          </span>
                          <span
                            className={`text-sm font-semibold transition-colors duration-500 ${
                              isDarkMode ? "text-purple-300" : "text-purple-600"
                            }`}
                          >
                            {category}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Data Quality */}
                {!isSectionHidden("data-quality") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`rounded-2xl shadow-lg p-6 border transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-gray-800/90 border-gray-600/50"
                        : `bg-gradient-to-br ${dataQualityColors.bg} border ${dataQualityColors.border}`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className={`text-lg font-bold flex items-center transition-colors duration-500 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <Award
                          className={`h-5 w-5 mr-2 transition-colors duration-500 ${
                            isDarkMode
                              ? "text-blue-400"
                              : dataQualityColors.text
                          }`}
                        />
                        Data Quality
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${dataQualityColors.text}`}
                        >
                          {dataQuality.overallScore}%
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            dataQualityColors.text
                          } bg-opacity-20 ${dataQualityColors.dotColor.replace(
                            "bg-",
                            "bg-opacity-20 bg-"
                          )}`}
                        >
                          {dataQualityColors.label}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(dataQuality.quality).map(
                        ([key, item]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex flex-col">
                              <span
                                className={`text-sm transition-colors duration-500 ${
                                  isDarkMode ? "text-gray-200" : "text-gray-600"
                                }`}
                              >
                                {item.label}
                              </span>
                              <span
                                className={`text-xs transition-colors duration-500 ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {item.description}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  item.complete
                                    ? "bg-green-500"
                                    : item.available
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span
                                className={`text-xs transition-colors duration-500 ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {item.complete
                                  ? "Complete"
                                  : item.available
                                  ? "Partial"
                                  : "Missing"}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    <div
                      className={`mt-4 pt-3 border-t transition-colors duration-500 ${
                        isDarkMode ? "border-gray-600" : "border-gray-200"
                      }`}
                    >
                      <div
                        className={`flex justify-between items-center text-xs transition-colors duration-500 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <span>
                          Availability: {dataQuality.availabilityScore}%
                        </span>
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
