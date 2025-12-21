import { useNavigate } from "react-router";
import { TwitterIcon, FacebookIcon, InstagramIcon, LinkedinIcon } from "lucide-react";
import logo from '/homelumina-logo.svg';

interface FooterProps {
  isDarkMode?: boolean;
}

export function Footer({ isDarkMode = false }: FooterProps) {
  const navigate = useNavigate();
  return (
    <footer className={`transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-900 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img src={logo} alt="Homelumina Logo" className={`h-8 w-8 rounded-xl shadow-lg border-2 p-1 ${
                isDarkMode 
                  ? 'border-blue-300 bg-gray-800' 
                  : 'border-blue-200 bg-white'
              }`} />
              <span className="ml-2 font-accent text-xl md:text-2xl font-bold">Homelumina</span>
            </div>
            <p className={`text-base md:text-lg mb-6 max-w-md leading-relaxed ${
              isDarkMode ? 'text-gray-300' : 'text-gray-300'
            }`}>
              Data-driven insights for smarter living decisions. Find your perfect place to call home with comprehensive neighborhood analysis.
            </p>
            
            {/* Social Icons */}
            <div className="flex space-x-4">
              <a href="https://twitter.com/homelumina" target="_blank" rel="noopener noreferrer" className={`transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-blue-300' : 'text-gray-400 hover:text-white'
              }`}>
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="https://facebook.com/homelumina" target="_blank" rel="noopener noreferrer" className={`transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-blue-300' : 'text-gray-400 hover:text-white'
              }`}>
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/homelumina" target="_blank" rel="noopener noreferrer" className={`transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-blue-300' : 'text-gray-400 hover:text-white'
              }`}>
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/homelumina" target="_blank" rel="noopener noreferrer" className={`transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-blue-300' : 'text-gray-400 hover:text-white'
              }`}>
                <LinkedinIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-accent text-lg md:text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate("/about")}
                  className={`transition-colors text-left ${
                    isDarkMode ? 'text-gray-300 hover:text-blue-300' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/contact")}
                  className={`transition-colors text-left ${
                    isDarkMode ? 'text-gray-300 hover:text-blue-300' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/")}
                  className={`transition-colors text-left ${
                    isDarkMode ? 'text-gray-300 hover:text-blue-300' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Search
                </button>
              </li>

            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-accent text-lg md:text-xl font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate("/contact")}
                  className={`transition-colors text-left ${
                    isDarkMode ? 'text-gray-300 hover:text-blue-300' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/contact")}
                  className={`transition-colors text-left ${
                    isDarkMode ? 'text-gray-300 hover:text-blue-300' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/contact")}
                  className={`transition-colors text-left ${
                    isDarkMode ? 'text-gray-300 hover:text-blue-300' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Data Sources
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/contact")}
                  className={`transition-colors text-left ${
                    isDarkMode ? 'text-gray-300 hover:text-blue-300' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Sitemap
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t mt-8 pt-8 text-center ${
          isDarkMode ? 'border-gray-800' : 'border-gray-800'
        }`}>
          <p className={`text-base font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-400'
          }`}>
            © {new Date().getFullYear()} Homelumina. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 