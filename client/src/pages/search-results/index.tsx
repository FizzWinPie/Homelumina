"use client"

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RangeSlider } from "@/components/ui/range-slider";
import { MapPin, ArrowLeft, Filter, List, BarChart3 } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import { useDebouncedState } from "@/lib/hooks"
import { ListView } from "./ListView"
import { MapView } from "./MapView"
import { SummaryView } from "./SummaryView"
import type { Filters, HealthMeasure, ZipCodeData } from "./types"
import { formatCurrency, formatNumber } from "./utils"
import { useQuery } from "@tanstack/react-query"

const UPPER_BOUND_PRICE = 10000000
const UPPER_BOUND_INCOME = 1250000
const UPPER_BOUND_HEALTH_RATIO = 1
const UPPER_BOUND_POPULATION = 500000

const getInitialFilters = (cityQueryParam: string | null, stateQueryParam: string | null): Filters => {
  return {
    city: cityQueryParam ?? null,
    state: stateQueryParam ?? "",
    minPrice: 0,
    maxPrice: UPPER_BOUND_PRICE,
    minIncome: 0,
    maxIncome: UPPER_BOUND_INCOME,
    healthMeasure: "Obesity among adults",
    maxHealthRatio: UPPER_BOUND_HEALTH_RATIO,
    minPoliceDepts: 0,
    minPoliceOfficers: 0,
    minHospitals: 0,
    minFireStations: 0,
    minFirefighters: 0,
    minChildcare: 0,
    minPopulation: 0,
    maxPopulation: UPPER_BOUND_POPULATION,
  }
}

/** Normalize SQL agent row (any key casing) to ZipCodeData for list/map/summary views. */
function agentRowsToZipCodeData(rows: Record<string, unknown>[]): ZipCodeData[] {
  const get = (row: Record<string, unknown>, key: string) => {
    const k = Object.keys(row).find((x) => x.toLowerCase() === key.toLowerCase());
    return k != null ? row[k] : undefined;
  };
  const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : typeof v === "string" ? parseFloat(v) || 0 : 0);
  const str = (v: unknown) => (v != null ? String(v) : "");
  return rows.map((row) => ({
    zipcode: str(get(row, "zipcode")),
    city: str(get(row, "city")),
    state: str(get(row, "state")),
    latitude: num(get(row, "latitude")),
    longitude: num(get(row, "longitude")),
    population: num(get(row, "population")),
    medianprice: num(get(row, "medianprice") ?? get(row, "medianlistingprice")),
    meanincome: num(get(row, "meanincome") ?? get(row, "meanincome")),
    healthratio: num(get(row, "healthratio") ?? get(row, "ratio")),
    policedepartmentscount: str(get(row, "policedepartmentscount") ?? get(row, "policedeptcount")),
    numpoliceofficerscount: str(get(row, "numpoliceofficerscount") ?? get(row, "policeofficercount")),
    hospitalscount: str(get(row, "hospitalscount") ?? get(row, "hospitalcount")) || null,
    firestationscount: str(get(row, "firestationscount") ?? get(row, "firestationcount")) || null,
    firefighterscount: str(get(row, "firefighterscount") ?? get(row, "firefightercount")),
    childcarecenterscount: str(get(row, "childcarecenterscount") ?? get(row, "childcarecount")),
  }))
}

type AgentState = { fromAgent: true; agentData: { sql: string; rows: Record<string, unknown>[]; summary?: string } }

export function SearchResults() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const cityQueryParam = searchParams.get("city")
  const stateQueryParam = searchParams.get("state")
  const agentPayload = (location.state as AgentState | null)?.fromAgent && (location.state as AgentState)?.agentData
    ? { fromAgent: true as const, agentData: (location.state as AgentState).agentData }
    : null

  const [viewMode, setViewMode] = useState<"list" | "map" | "summary">("list")
  const [showFilters, setShowFilters] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const {
    value: filters,
    debouncedValue: debouncedFilters,
    setValue: setFilters
  } = useDebouncedState<Filters>(getInitialFilters(cityQueryParam, stateQueryParam), 500)

  // Sync filters from URL when landing with ?city= & ?state= (e.g. from hero search) so zipcode query runs with correct params
  useEffect(() => {
    setFilters(getInitialFilters(cityQueryParam, stateQueryParam))
  }, [cityQueryParam, stateQueryParam, setFilters])

  const { data: healthMeasures, isPending: isHealthMeasuresPending, error: healthMeasuresError } = useQuery({
    queryKey: ["healthMeasures"],
    queryFn: async () => {
      try {
        const response = await fetch(API_ENDPOINTS.healthMeasures())
        if (!response.ok) {
          if (response.status === 0 || response.status >= 500) {
            throw new Error('Server is currently unavailable. Please try again later.');
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json() as { success: boolean, data: HealthMeasure[], message?: string }
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch health measures')
        }
        return result.data.map((m: HealthMeasure) => m.measure) as unknown as string[]
      } catch (error) {
        // Handle network errors gracefully
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Server is currently unavailable. Please try again later.');
        }
        if (error instanceof Error) {
          if (error.message.includes('fetch') || 
              error.message.includes('network') || 
              error.message.includes('connection') ||
              error.message.includes('Failed to fetch')) {
            throw new Error('Server is currently unavailable. Please try again later.');
          }
        }
        throw error;
      }
    },
    initialData: [
      "Current asthma among adults",
      "Depression among adults",
      "Feeling socially isolated among adults",
      "Housing insecurity in the past 12 months among adults",
      "Obesity among adults",
      "Visits to doctor for routine checkup within the past year among adults"
    ],
  })

  const { data: zipCodeSummaries, isPending: isZipCodeSummariesPending, error: zipCodeError } = useQuery({
    queryKey: ["zipCodes", JSON.stringify(debouncedFilters)],
    queryFn: async () => {
      try {
        const response = await fetch(API_ENDPOINTS.zipcodeSummaries(debouncedFilters))
        
        // Check if the server is not responding
        if (!response.ok) {
          if (response.status === 0 || response.status >= 500) {
            throw new Error('Server is currently unavailable. Please try again later.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json() as { success: boolean, data: ZipCodeData[], suggestion?: string, error?: string }
        
        // Handle both success and error responses from our API
        if (!result.success) {
          // This is a validation error or other API error
          const error = new Error(result.error || 'Search failed');
          (error as any).isApiError = true;
          (error as any).apiResponse = result;
          throw error;
        }
        
        // Return the data array and any suggestion message
        return {
          data: result.data || [],
          suggestion: result.suggestion || null
        }
      } catch (error) {
        // Handle network errors (server down, no internet, etc.)
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Server is currently unavailable. Please try again later.');
        }
        // Handle other network-related errors
        if (error instanceof Error) {
          if (error.message.includes('fetch') || 
              error.message.includes('network') || 
              error.message.includes('connection') ||
              error.message.includes('Failed to fetch')) {
            throw new Error('Server is currently unavailable. Please try again later.');
          }
        }
        throw error;
      }
    },
    enabled: !agentPayload && ((!!cityQueryParam && !!stateQueryParam) || !!stateQueryParam),
  })

  // When we have agent result from hero, use it; otherwise use API zipcode summaries
  const effectiveZipCodeSummaries = agentPayload
    ? { data: agentRowsToZipCodeData(agentPayload.agentData.rows), suggestion: agentPayload.agentData.summary ?? null }
    : zipCodeSummaries

  let results = null
  if (!agentPayload && (zipCodeError || healthMeasuresError)) {
    const error = zipCodeError || healthMeasuresError
    const errorMessage = error?.message || 'An error occurred while searching. Please try again.';
    
    // Check if it's an API error with detailed information
    const apiError = (error as any)?.isApiError;
    const apiResponse = (error as any)?.apiResponse;
    
    // Check if it's a validation error (400 status)
    const isValidationError = apiError || 
                             errorMessage.includes('State must be') || 
                             errorMessage.includes('State is required') ||
                             errorMessage.includes('Health measure is required') ||
                             errorMessage.includes('City name');
    
    // Check if it's a server failure - expanded detection
    const isServerError = errorMessage.includes('Server is currently unavailable') ||
                         errorMessage.includes('Unable to connect to the server') ||
                         errorMessage.includes('check your internet connection') ||
                         errorMessage.includes('Failed to fetch') ||
                         errorMessage.includes('fetch') ||
                         errorMessage.includes('network') ||
                         errorMessage.includes('connection') ||
                         errorMessage.includes('unavailable') ||
                         errorMessage.includes('timeout');
    
    // Use API error message if available
    const displayMessage = apiResponse?.error || errorMessage;
    
    // Provide more helpful message for server errors
    const finalMessage = isServerError && !apiResponse?.error ? 
      'Server is currently unavailable. Please try again later.' : 
      displayMessage;
    
    results = (
      <div className="text-center py-12">
        <div className={`${
          isValidationError ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 
          isServerError ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
          'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        } border rounded-lg p-6 max-w-2xl mx-auto`}>
          <h3 className={`text-lg font-semibold ${
            isValidationError ? 'text-yellow-800 dark:text-yellow-200' : 
            isServerError ? 'text-orange-800 dark:text-orange-200' :
            'text-red-800 dark:text-red-200'
          } mb-2`}>
            {isValidationError ? 'Search Input Error' : 
             isServerError ? 'Server Unavailable' : 
             'Search Error'}
          </h3>
          <p className={`${
            isValidationError ? 'text-yellow-600 dark:text-yellow-400' : 
            isServerError ? 'text-orange-600 dark:text-orange-400' :
            'text-red-600 dark:text-red-400'
          } text-sm mb-4`}>
            {finalMessage}
          </p>
          {isValidationError && (
            <p className="text-yellow-500 dark:text-yellow-300 text-xs mb-4">
              Please correct the input and try again.
            </p>
          )}
          {isServerError && (
            <p className="text-orange-500 dark:text-orange-300 text-xs mb-4">
              This is a temporary issue. Please try again in a few moments.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {isValidationError && (
              <Button 
                onClick={() => {
                  navigate('/');
                }} 
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                Go to Home
              </Button>
            )}
            {isServerError && (
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Retry
              </Button>
            )}
            <Button 
              onClick={() => navigate('/')} 
              className={`${
                isValidationError ? 'bg-yellow-600 hover:bg-yellow-700' : 
                isServerError ? 'bg-orange-600 hover:bg-orange-700' :
                'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {isValidationError ? 'Try New Search' : 
               isServerError ? 'Go to Home' : 
               'Go to Home'}
            </Button>
          </div>
        </div>
      </div>
    )
  } else if (!agentPayload && (isHealthMeasuresPending || isZipCodeSummariesPending) && (!!cityQueryParam || !!stateQueryParam)) {
    results = (
      <div className="flex justify-center h-full mt-10">
        <span className="text-violet-500 text-lg animate-spin" />
      </div>
    )
  } else if (!effectiveZipCodeSummaries?.data || effectiveZipCodeSummaries.data.length === 0) {
    const suggestionMessage = effectiveZipCodeSummaries?.suggestion || 'No results found matching your criteria.';
    const suggestionDetails = effectiveZipCodeSummaries?.suggestion ? 'Try the suggested alternatives or adjust your filters.' : 'Try adjusting your filters or search terms.';
    
    results = (
      <div className="text-center py-12">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">No Results Found</h3>
          <p className="text-blue-600 dark:text-blue-400 text-sm mb-4">
            {suggestionMessage}
          </p>
          <p className="text-blue-500 dark:text-blue-300 text-xs mb-4">
            {suggestionDetails}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              onClick={() => {
                navigate('/');
              }} 
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Go to Home
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try New Search
            </Button>
          </div>
        </div>
      </div>
    )
  } else {
    const totalItems = effectiveZipCodeSummaries.data.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = effectiveZipCodeSummaries.data.slice(startIndex, endIndex)

    results = (
      <>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} results
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-600 dark:text-gray-300">Items per page:</Label>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(parseInt(value))
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {
          viewMode === "map" ? (
            <MapView zipCodeSummaries={currentItems} currentHealthMeasure={debouncedFilters.healthMeasure} />
          ) : viewMode === "summary" ? (
            <SummaryView zipCodeSummaries={currentItems} />
          ) : (
            <ListView zipCodeSummaries={currentItems} currentHealthMeasure={debouncedFilters.healthMeasure} />
          ) 
        }
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {/* Generate page numbers with proper ellipsis */}
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 7; // Show up to 7 page numbers
                  
                  if (totalPages <= maxVisiblePages) {
                    // Show all pages if total is small
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Show pages with ellipsis for large totals
                    if (currentPage <= 4) {
                      // Near the beginning: show 1, 2, 3, 4, 5, ..., last
                      for (let i = 1; i <= 5; i++) {
                        pages.push(i);
                      }
                      pages.push('...');
                      pages.push(totalPages);
                    } else if (currentPage >= totalPages - 3) {
                      // Near the end: show 1, ..., last-4, last-3, last-2, last-1, last
                      pages.push(1);
                      pages.push('...');
                      for (let i = totalPages - 4; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // In the middle: show 1, ..., current-1, current, current+1, ..., last
                      pages.push(1);
                      pages.push('...');
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(i);
                      }
                      pages.push('...');
                      pages.push(totalPages);
                    }
                  }
                  
                  return pages.map((page, index) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${index}`} className="text-gray-500 px-2">
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page as number)}
                        className="w-8 h-8"
                      >
                        {page}
                      </Button>
                    );
                  });
                })()}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
            
            {/* Go to page input for large page counts */}
            {totalPages > 10 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>Go to page:</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-16 h-8 text-center"
                />
                <span>of {totalPages}</span>
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {agentPayload ? "Agent query results" : `Results for "${cityQueryParam ?? stateQueryParam ?? "Unknown Location"}"`}
        </h1>
        {agentPayload?.agentData.summary && (
          <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-2xl">{agentPayload.agentData.summary}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-0">
                <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              New Search
                </Button>
              </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Mobile Filters Button */}
            <Button
              variant="outline"
              className="cursor-pointer sm:hidden w-full"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            {/* Desktop Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="cursor-pointer hidden sm:inline-flex"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            {/* View Mode Buttons - always visible, stack on mobile */}
            <div className="flex border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 w-full sm:w-auto mt-2 sm:mt-0">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
                className="rounded-r-none cursor-pointer flex-1"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                onClick={() => setViewMode("map")}
                className="rounded-none cursor-pointer flex-1"
              >
                <MapPin className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "summary" ? "default" : "ghost"}
                onClick={() => setViewMode("summary")}
                className="rounded-l-none cursor-pointer flex-1"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Responsive flex-col on mobile, flex-row on desktop */}
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Sidebar Filters: Only show on sm+ */}
        {showFilters && (
          <div className="w-full sm:w-80 space-y-6 hidden sm:block">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Housing Filters */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Housing</Label>
                  <div className="space-y-4 mt-2">
                <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Median Price Range</Label>
                      <div className="px-2 mt-2">
                        <RangeSlider
                          value={[filters.minPrice, filters.maxPrice]}
                          onValueChange={([min, max]: [number, number]) => setFilters({ ...filters, minPrice: min, maxPrice: max })}
                          max={UPPER_BOUND_PRICE}
                          step={10000}
                          className="w-full"
                        />
                  </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{formatCurrency(filters.minPrice)}</span>
                        <span>{formatCurrency(filters.maxPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

                {/* Income Filters */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Income</Label>
                  <div className="space-y-4 mt-2">
                <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Mean Income Range</Label>
                      <div className="px-2 mt-2">
                        <RangeSlider
                          value={[filters.minIncome, filters.maxIncome]}
                          onValueChange={([min, max]: [number, number]) => setFilters({ ...filters, minIncome: min, maxIncome: max })}
                          max={UPPER_BOUND_INCOME}
                          step={10000}
                          className="w-full"
                        />
                  </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{formatCurrency(filters.minIncome)}</span>
                        <span>{formatCurrency(filters.maxIncome)}</span>
                  </div>
              </div>
            </div>
          </div>

                {/* Health Filters */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Health</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Health Measure</Label>
                      <Select
                        value={filters.healthMeasure}
                        onValueChange={(value) => setFilters({ ...filters, healthMeasure: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a health measure" />
                        </SelectTrigger>
                        <SelectContent>
                          {healthMeasures ? healthMeasures.map((measure) => (
                            <SelectItem key={measure} value={measure}>{measure}</SelectItem>
                          )) : (
                            null
                          )}
                        </SelectContent>
                      </Select>
                      </div>
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Max Health Ratio</Label>
                      <div className="px-2 mt-2">
                        <Slider
                          value={[filters.maxHealthRatio]}
                          onValueChange={([value]: [number]) => setFilters({ ...filters, maxHealthRatio: value })}
                          max={UPPER_BOUND_HEALTH_RATIO}
                          step={0.01}
                          className="w-full"
                        />
                    </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Max: {Math.round(filters.maxHealthRatio * 100)}%
                    </div>
                    </div>
                  </div>
                      </div>

                {/* Population Filters */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Population</Label>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Population Range</Label>
                      <div className="px-2 mt-2">
                        <RangeSlider
                          value={[filters.minPopulation, filters.maxPopulation]}
                          onValueChange={([min, max]: [number, number]) =>
                            setFilters({ ...filters, minPopulation: min, maxPopulation: max })
                          }
                          max={UPPER_BOUND_POPULATION}
                          step={10000}
                          className="w-full"
                        />
                    </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{formatNumber(filters.minPopulation)}</span>
                        <span>{formatNumber(filters.maxPopulation)}</span>
                  </div>
                      </div>
                    </div>
                    </div>

                {/* Safety & Services Filters */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Safety & Services</Label>
                  <div className="space-y-3 mt-2">
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Min Police Departments</Label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minPoliceDepts}
                        onChange={(e) =>
                          setFilters({ ...filters, minPoliceDepts: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Min Police Officers</Label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minPoliceOfficers}
                        onChange={(e) =>
                          setFilters({ ...filters, minPoliceOfficers: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                  </div>
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Min Hospitals</Label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minHospitals}
                        onChange={(e) =>
                          setFilters({ ...filters, minHospitals: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                      </div>
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Min Fire Stations</Label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minFireStations}
                        onChange={(e) =>
                          setFilters({ ...filters, minFireStations: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Min Firefighters</Label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minFirefighters}
                        onChange={(e) =>
                          setFilters({ ...filters, minFirefighters: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Min Childcare Centers</Label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minChildcare}
                        onChange={(e) =>
                          setFilters({ ...filters, minChildcare: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={() => setFilters(getInitialFilters(cityQueryParam, stateQueryParam))}>Reset Filters</Button>
              </CardContent>
            </Card>
                      </div>
        )}
        {/* Mobile Filters Drawer/Modal */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:hidden">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setIsMobileFiltersOpen(false)}></div>
            {/* Drawer */}
            <div className="relative w-full bg-white dark:bg-gray-900 rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto shadow-lg animate-slideInUp">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Filters</span>
                <Button variant="ghost" onClick={() => setIsMobileFiltersOpen(false)}>Close</Button>
              </div>
              {/* Filters content (reuse the same as sidebar) */}
              <CardContent className="space-y-6">
                {/* Housing Filters */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Housing</Label>
                  <div className="space-y-4 mt-2">
                <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Median Price Range</Label>
                      <div className="px-2 mt-2">
                        <RangeSlider
                          value={[filters.minPrice, filters.maxPrice]}
                          onValueChange={([min, max]: [number, number]) => setFilters({ ...filters, minPrice: min, maxPrice: max })}
                          max={UPPER_BOUND_PRICE}
                          step={10000}
                          className="w-full"
                        />
                  </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{formatCurrency(filters.minPrice)}</span>
                        <span>{formatCurrency(filters.maxPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

                {/* Income Filters */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Income</Label>
                  <div className="space-y-4 mt-2">
                <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Mean Income Range</Label>
                      <div className="px-2 mt-2">
                        <RangeSlider
                          value={[filters.minIncome, filters.maxIncome]}
                          onValueChange={([min, max]: [number, number]) => setFilters({ ...filters, minIncome: min, maxIncome: max })}
                          max={UPPER_BOUND_INCOME}
                          step={10000}
                          className="w-full"
                        />
                  </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{formatCurrency(filters.minIncome)}</span>
                        <span>{formatCurrency(filters.maxIncome)}</span>
                  </div>
              </div>
            </div>
          </div>

                {/* Health Filters */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Health</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Health Measure</Label>
                      <Select
                        value={filters.healthMeasure}
                        onValueChange={(value) => setFilters({ ...filters, healthMeasure: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a health measure" />
                        </SelectTrigger>
                        <SelectContent>
                          {healthMeasures ? healthMeasures.map((measure) => (
                            <SelectItem key={measure} value={measure}>{measure}</SelectItem>
                          )) : (
                            null
                          )}
                        </SelectContent>
                      </Select>
                      </div>
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Max Health Ratio</Label>
                      <div className="px-2 mt-2">
                        <Slider
                          value={[filters.maxHealthRatio]}
                          onValueChange={([value]: [number]) => setFilters({ ...filters, maxHealthRatio: value })}
                          max={UPPER_BOUND_HEALTH_RATIO}
                          step={0.01}
                          className="w-full"
                        />
                    </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Max: {Math.round(filters.maxHealthRatio * 100)}%
                    </div>
                    </div>
                  </div>
                      </div>

                {/* Population Filters */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Population</Label>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Population Range</Label>
                      <div className="px-2 mt-2">
                        <RangeSlider
                          value={[filters.minPopulation, filters.maxPopulation]}
                          onValueChange={([min, max]: [number, number]) =>
                            setFilters({ ...filters, minPopulation: min, maxPopulation: max })
                          }
                          max={UPPER_BOUND_POPULATION}
                          step={10000}
                          className="w-full"
                        />
                    </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{formatNumber(filters.minPopulation)}</span>
                        <span>{formatNumber(filters.maxPopulation)}</span>
                  </div>
                      </div>
                    </div>
                    </div>

                {/* Safety & Services Filters */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Safety & Services</Label>
                  <div className="space-y-3 mt-2">
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Min Police Departments</Label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minPoliceDepts}
                        onChange={(e) =>
                          setFilters({ ...filters, minPoliceDepts: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Min Police Officers</Label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minPoliceOfficers}
                        onChange={(e) =>
                          setFilters({ ...filters, minPoliceOfficers: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                  </div>
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Min Hospitals</Label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minHospitals}
                        onChange={(e) =>
                          setFilters({ ...filters, minHospitals: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                      </div>
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Min Fire Stations</Label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minFireStations}
                        onChange={(e) =>
                          setFilters({ ...filters, minFireStations: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Min Firefighters</Label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minFirefighters}
                        onChange={(e) =>
                          setFilters({ ...filters, minFirefighters: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Min Childcare Centers</Label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.minChildcare}
                        onChange={(e) =>
                          setFilters({ ...filters, minChildcare: Number.parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={() => setFilters(getInitialFilters(cityQueryParam, stateQueryParam))}>Reset Filters</Button>
              </CardContent>
            </div>
          </div>
        )}
        {/* Results Area */}
        <div className="flex-1">
          {results}
        </div>
      </div>
    </div>
  )
}
