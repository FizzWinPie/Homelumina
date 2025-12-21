import { HeroSection } from "@/components/HeroSection";
import { QuickSearchCategories } from "@/components/QuickSearchCategories";
import { HowItWorks } from "@/components/HowItWorks";
import { FeaturedLocations } from "@/components/FeaturedLocations";
import { useDarkMode } from "@/providers/DarkModeProvider";

export function Home() {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      
      
      <HeroSection isDarkMode={isDarkMode} />
      <QuickSearchCategories isDarkMode={isDarkMode} />
      <HowItWorks isDarkMode={isDarkMode} />
      <FeaturedLocations isDarkMode={isDarkMode} />
    </div>
  );
}