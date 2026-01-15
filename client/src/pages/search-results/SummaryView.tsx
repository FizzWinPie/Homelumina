import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Home, Heart, Shield, Flame, Baby, Building2, MapPin } from "lucide-react";
import type { ZipCodeData } from "./types";
import { formatCurrency, formatNumber } from "./utils";
import { useNavigate } from "react-router";

export function SummaryView({ zipCodeSummaries }: { 
  zipCodeSummaries: ZipCodeData[]
}) {
  const navigate = useNavigate();
  
  // Filter out ZIP codes with zero population or null data
  const validZipCodes = zipCodeSummaries.filter(item => 
    item.population > 0 && 
    item.medianprice !== null && 
    item.medianprice !== undefined && 
    item.medianprice > 0 &&
    item.meanincome !== null && 
    item.meanincome !== undefined && 
    item.meanincome > 0
  );

  // Calculate aggregated statistics only for valid ZIP codes
  const totalPopulation = validZipCodes.reduce((sum, item) => sum + item.population, 0);
  const avgMedianPrice = validZipCodes.length > 0 
    ? validZipCodes.reduce((sum, item) => sum + (item.medianprice || 0), 0) / validZipCodes.length 
    : 0;
  const avgMeanIncome = validZipCodes.length > 0 
    ? validZipCodes.reduce((sum, item) => sum + (item.meanincome || 0), 0) / validZipCodes.length 
    : 0;
  const avgHealthRatio = validZipCodes.length > 0 
    ? validZipCodes.reduce((sum, item) => sum + (item.healthratio || 0), 0) / validZipCodes.length 
    : 0;
  
  const totalHospitals = zipCodeSummaries.reduce((sum, item) => sum + (parseInt(item.hospitalscount || "0") || 0), 0);
  const totalPoliceStations = zipCodeSummaries.reduce((sum, item) => sum + (parseInt(item.policedepartmentscount || "0") || 0), 0);
  const totalFireStations = zipCodeSummaries.reduce((sum, item) => sum + (parseInt(item.firestationscount || "0") || 0), 0);
  const totalChildcareCenters = zipCodeSummaries.reduce((sum, item) => sum + (parseInt(item.childcarecenterscount || "0") || 0), 0);
  const totalPoliceOfficers = zipCodeSummaries.reduce((sum, item) => sum + (parseInt(item.numpoliceofficerscount || "0") || 0), 0);
  const totalFirefighters = zipCodeSummaries.reduce((sum, item) => sum + (parseInt(item.firefighterscount || "0") || 0), 0);

  const topZipCodes = validZipCodes
    .sort((a, b) => b.population - a.population);

  const handleZipCodeClick = (zipcode: string) => {
    navigate(`/location-details?q=${zipcode}`);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Population
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatNumber(totalPopulation)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Avg. Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(avgMeanIncome)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Avg. Home Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(avgMedianPrice)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Health Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {(avgHealthRatio * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facilities Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Public Facilities Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Building2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalHospitals}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hospitals</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Shield className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totalPoliceStations}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Police Stations</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Flame className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totalFireStations}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Fire Stations</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Baby className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalChildcareCenters}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Childcare Centers</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalPoliceOfficers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Police Officers</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalFirefighters}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Firefighters</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ZIP Codes by Population */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
            ZIP Codes by Population ({topZipCodes.length} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-100 overflow-y-auto">
            {topZipCodes.length > 0 ? (
              <div className="space-y-3">
                {topZipCodes.map((item, index) => (
                <div 
                  key={item.zipcode} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => handleZipCodeClick(item.zipcode)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {item.zipcode} - {item.city}, {item.state}
                        <MapPin className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Population: {formatNumber(item.population)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.medianprice || 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {((item.healthratio || 0) * 100).toFixed(1)}% health
                    </div>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No ZIP codes with valid population data found.</p>
                <p className="text-sm mt-2">Try adjusting your search filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 