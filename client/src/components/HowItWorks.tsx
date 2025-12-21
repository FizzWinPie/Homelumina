import { Search, MapPin, Home } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search",
    description: "Enter your desired location or use our smart filters to find areas that match your criteria."
  },
  {
    icon: MapPin,
    title: "Compare",
    description: "Compare neighborhoods based on real estate prices, safety, schools, and amenities."
  },
  {
    icon: Home,
    title: "Decide",
    description: "Make informed decisions with comprehensive data on your potential new home area."
  }
];

interface HowItWorksProps {
  isDarkMode?: boolean;
}

export function HowItWorks({ isDarkMode = false }: HowItWorksProps) {
  return (
    <section className={`py-20 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            How It Works
          </h2>
          <p className={`font-accent text-lg md:text-xl max-w-3xl mx-auto font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Our platform makes finding your perfect home location simple and data-driven. 
            Get comprehensive insights in just three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {steps.map((step, index) => (
            <div key={index} className="text-center group relative">
              {/* Step Number Badge */}
              <div className="mb-8">
                <span className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl text-2xl font-bold shadow-xl">
                  {index + 1}
                </span>
              </div>
              
              {/* Main Icon */}
              <div className="relative mb-8">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-3xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 border-2 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 group-hover:border-blue-500' 
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 group-hover:border-blue-200'
                }`}>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                </div>
                
                {/* Arrow to next step */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 left-full transform translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              
              <h3 className={`font-accent text-xl md:text-2xl font-bold mb-4 transition-colors ${
                isDarkMode 
                  ? 'text-white group-hover:text-blue-400' 
                  : 'text-gray-900 group-hover:text-blue-600'
              }`}>
                {step.title}
              </h3>
              <p className={`text-base md:text-lg leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 