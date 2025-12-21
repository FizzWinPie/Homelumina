import { Baby, Building2, DollarSign, Flame, Heart, Home, Info, Shield, Users } from "lucide-react";
import type { ZipCodeData } from "./types";
import { formatCurrency, formatNumber } from "./utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export function ZipCodeCard(
  { item, isMapPopup = false, currentHealthMeasure }:
  { item: ZipCodeData; isMapPopup?: boolean, currentHealthMeasure: string }
) {
    const navigate = useNavigate()

    return (
      <div className={isMapPopup ? "space-y-3" : "space-y-5"}>
        {!isMapPopup && (
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {item.zipcode} - {item.city}, {item.state}
              </h3>
            </div>
          </div>
        )}

        {/* Key Metrics Grid - Original 3-column layout for regular cards */}
        {isMapPopup ? (
          // Vertical layout for map popup only
          <div className="space-y-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Population</span>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400">{formatNumber(item.population)}</span>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Median Income</span>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(item.meanincome)}</span>
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Home className="w-4 h-4 text-orange-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Home Price</span>
                </div>
                <span className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(item.medianprice)}</span>
              </div>
            </div>
          </div>
        ) : (
          // Responsive grid: 1 column on mobile, 3 on sm+
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Population</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(item.population)}</p>
                </div>
                <div className="text-blue-500">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Median Income</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(item.meanincome)}</p>
                </div>
                <div className="text-green-500">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Home Price</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(item.medianprice)}</p>
                </div>
                <div className="text-orange-500">
                  <Home className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health & Wellness Metrics */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className={`font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center ${isMapPopup ? "text-sm" : ""}`}>
            <Heart className={`text-red-500 mr-2 ${isMapPopup ? "w-4 h-4" : "w-5 h-5"}`} />
            Health & Wellness Metrics
          </h4>
          <div className="space-y-2">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className={`font-medium text-gray-700 dark:text-gray-300 ${isMapPopup ? "text-xs" : "text-sm"}`}>
                  Health Ratio ({currentHealthMeasure})
                </span>
                <span className={`font-bold text-yellow-600 dark:text-yellow-400 ${isMapPopup ? "text-xs" : "text-sm"}`}>
                  {(item.healthratio * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
                <div className="bg-yellow-500 dark:bg-yellow-400 h-2 rounded-full" style={{ width: `${item.healthratio * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Public Facilities & Services */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className={`font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center ${isMapPopup ? "text-sm" : ""}`}>
            <Building2 className={`text-blue-500 mr-2 ${isMapPopup ? "w-4 h-4" : "w-5 h-5"}`} />
            Public Facilities & Services
          </h4>
          {/* Responsive grid: 1 column on xs, 2 on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <Building2 className="w-3 h-3 text-yellow-600 dark:text-yellow-400 mr-1" />
                <div className={`text-yellow-600 dark:text-yellow-400 font-bold ${isMapPopup ? "text-sm" : "text-lg"}`}>
                  {item.hospitalscount || "0"}
                </div>
              </div>
              <div className={`text-gray-600 dark:text-gray-300 ${isMapPopup ? "text-xs" : "text-xs"}`}>Hospitals</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <Shield className="w-3 h-3 text-red-600 dark:text-red-400 mr-1" />
                <div className={`text-red-600 dark:text-red-400 font-bold ${isMapPopup ? "text-sm" : "text-lg"}`}>
                  {item.policedepartmentscount || "0"}
                </div>
              </div>
              <div className={`text-gray-600 dark:text-gray-300 ${isMapPopup ? "text-xs" : "text-xs"}`}>Police Stations</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <Flame className="w-3 h-3 text-red-600 dark:text-red-400 mr-1" />
                <div className={`text-red-600 dark:text-red-400 font-bold ${isMapPopup ? "text-sm" : "text-lg"}`}>
                  {item.firestationscount || "0"}
                </div>
              </div>
              <div className={`text-gray-600 dark:text-gray-300 ${isMapPopup ? "text-xs" : "text-xs"}`}>Fire Stations</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <Baby className="w-3 h-3 text-green-600 dark:text-green-400 mr-1" />
                <div className={`text-green-600 dark:text-green-400 font-bold ${isMapPopup ? "text-sm" : "text-lg"}`}>
                  {item.childcarecenterscount || "0"}
                </div>
              </div>
              <div className={`text-gray-600 dark:text-gray-300 ${isMapPopup ? "text-xs" : "text-xs"}`}>Childcare Centers</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400 mr-1" />
                <div className={`text-blue-600 dark:text-blue-400 font-bold ${isMapPopup ? "text-sm" : "text-lg"}`}>
                  {item.numpoliceofficerscount || "0"}
                </div>
              </div>
              <div className={`text-gray-600 dark:text-gray-300 ${isMapPopup ? "text-xs" : "text-xs"}`}>Police Officers</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <Flame className="w-3 h-3 text-orange-600 dark:text-orange-400 mr-1" />
                <div className={`text-orange-600 dark:text-orange-400 font-bold ${isMapPopup ? "text-sm" : "text-lg"}`}>
                  {item.firefighterscount || "0"}
                </div>
              </div>
              <div className={`text-gray-600 dark:text-gray-300 ${isMapPopup ? "text-xs" : "text-xs"}`}>Firefighters</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button size="sm" className="px-8" onClick={() => navigate(`/location-details?q=${encodeURIComponent(item.zipcode)}`)}>
            <Info className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    )
  }