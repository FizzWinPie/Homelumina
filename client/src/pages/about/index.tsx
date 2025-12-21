import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Search, 
  MapPin, 
  TrendingUp, 
  Shield, 
  Users, 
  Award, 
  Heart,
  Building2,
  School,
  Car,
  TreePine
} from "lucide-react";

export function About() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Homelumina</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Your intelligent companion for finding the perfect place to call home. We combine comprehensive data analysis with intuitive design to help you make informed decisions about where to live.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Search className="w-4 h-4 mr-2" />
              Smart Search
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Data-Driven
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Trusted Data
            </Badge>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                We believe everyone deserves to find their perfect home. Homelumina transforms complex real estate and community data into clear, actionable insights that help you discover neighborhoods that match your lifestyle, budget, and aspirations.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                From first-time homebuyers to seasoned investors, we provide the tools and information you need to make confident decisions about your next move.
              </p>
            </div>
            <div className="relative">
              <Card className="bg-white dark:bg-gray-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Heart className="w-6 h-6 mr-3 text-red-500" />
                    What We Believe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">Transparency in data and pricing</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">Community-focused insights</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">User-friendly technology</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">Comprehensive neighborhood analysis</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What Makes Us Different
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We go beyond basic property listings to provide comprehensive insights about communities, amenities, and quality of life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Location Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Advanced mapping and location-based insights help you understand neighborhood dynamics, commute times, and local amenities.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Market Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Real-time market data, price trends, and investment potential analysis to help you make informed financial decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Community Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Detailed information about schools, healthcare, safety, and community demographics to find your perfect neighborhood.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Facility Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Comprehensive mapping of hospitals, police stations, fire departments, and childcare centers in your area.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-4">
                  <School className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Education Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  School ratings, district information, and educational opportunities to help families make the best choices.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                  <TreePine className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Quality of Life</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Health metrics, environmental factors, and lifestyle indicators to help you find a community that matches your values.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Built by Experts
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Our team combines expertise in real estate, data science, and user experience to create the most comprehensive home search platform.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Data Scientists
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Experts in analyzing complex real estate and community data to provide accurate insights.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Real Estate Experts
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Industry professionals who understand what matters most to homebuyers and investors.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  UX Designers
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Creative professionals who make complex data accessible and beautiful to use.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start exploring neighborhoods and discover the perfect place to call home.
          </p>
          <button 
            onClick={() => navigate("/")}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
          >
            Start Your Search
          </button>
        </div>
      </div>
    </div>
  );
}
