import { Home, Building2, School, Heart, Shield } from "lucide-react";
import { useNavigate } from "react-router";

const categories = [
  {
    icon: Home,
    title: "Best for Families",
    description: "Family-friendly neighborhoods with great schools",
    color: "text-blue-600",
    searchQuery: "Philadelphia, PA",
    reason: "Top-rated schools and family amenities"
  },
  {
    icon: Building2,
    title: "Affordable Living",
    description: "Budget-friendly areas with good value",
    color: "text-green-600",
    searchQuery: "Detroit, MI",
    reason: "Lowest median home prices"
  },
  {
    icon: School,
    title: "Job Opps",
    description: "Areas with strong job markets",
    color: "text-purple-600",
    searchQuery: "Austin, TX",
    reason: "Strong tech job market"
  },
  {
    icon: Shield,
    title: "Safe Neighborhoods",
    description: "Low crime areas with community safety",
    color: "text-orange-600",
    searchQuery: "Irvine, CA",
    reason: "Lowest crime rates"
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Areas with healthcare facilities and parks",
    color: "text-red-600",
    searchQuery: "Rochester, MN",
    reason: "World-class healthcare facilities"
  }
];

interface QuickSearchCategoriesProps {
  isDarkMode?: boolean;
}

export function QuickSearchCategories({ isDarkMode = false }: QuickSearchCategoriesProps) {
  const navigate = useNavigate();

  const handleCategoryClick = (category: any) => {
    navigate(`/location-details?q=${encodeURIComponent(category.searchQuery)}&category=${encodeURIComponent(category.title)}`);
  };

  return (
    <section className={`py-20 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Search Categories
          </h2>
          <p className={`font-accent text-lg md:text-xl max-w-3xl mx-auto font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Find the perfect location based on your priorities and lifestyle preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(category)}
              className={`group relative rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border transform hover:-translate-y-2 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 hover:border-blue-600' 
                  : 'bg-white border-gray-100 hover:border-blue-200'
              }`}
            >
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50'
              }`}></div>
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-300 shadow-lg ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-gray-700 to-gray-600 group-hover:from-blue-900 group-hover:to-indigo-900' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100'
                }`}>
                  <category.icon className={`h-10 w-10 group-hover:scale-110 transition-transform duration-300 ${category.color}`} />
                </div>
                <h3 className={`font-accent text-xl md:text-xl font-bold mb-3 transition-colors ${
                  isDarkMode 
                    ? 'text-white group-hover:text-blue-300' 
                    : 'text-gray-900 group-hover:text-blue-900'
                }`}>
                  {category.title}
                </h3>
                <p className={`text-base md:text-md leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 