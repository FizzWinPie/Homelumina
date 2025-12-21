import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { Mail, Info, Menu, X, Sun, Moon } from "lucide-react";
import logo from "/homelumina-logo.svg";
import { useDarkMode } from "@/providers/DarkModeProvider";
import { logger } from "@/utils/logger";

export function Navigation() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const { current: authSingleton } = useRef(auth);
  // undefined -> loading, null -> not logged in, User -> logged in
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = authSingleton?.onAuthStateChanged((user) => {
      setCurrentUser(user);
      logger.debug('Auth state changed', { user: user ? { uid: user.uid, email: user.email } : null });
      if (user?.displayName) {
        logger.debug('User display name', { displayName: user.displayName });
      }
    });

    return () => unsubscribe?.();
  }, [authSingleton]);

  const handleSignOut = async () => {
    if (!authSingleton) {
      logger.error('Auth not initialized');
      return;
    }
    try {
      await signOut(authSingleton);
      logger.info('User signed out successfully');
      navigate("/");
    } catch (error) {
      logger.error('Error signing out', { error });
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-sm transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-900/95 border-gray-700/50' 
        : 'bg-white/95 border-gray-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={handleLogoClick}
          >
            <img
              src={logo}
              alt="Homelumina Logo"
              className={`w-10 h-10 rounded-xl shadow-lg border-2 p-1 mr-3 group-hover:scale-110 transition-transform duration-200 ${
                isDarkMode 
                  ? 'border-blue-300 bg-gray-800' 
                  : 'border-blue-200 bg-white'
              }`}
            />
            <span className="font-accent text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-colors">
              Homelumina
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate("/about")}
              className={`flex items-center transition-all duration-200 font-medium group ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-blue-400' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Info className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
              About Us
            </button>
            <button
              onClick={() => navigate("/contact")}
              className={`flex items-center transition-all duration-200 font-medium group ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-blue-400' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Mail className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
              Contact
            </button>
          </div>

          {/* Desktop Login/Sign Up */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser !== undefined && (
              currentUser ? (
                <Button
                  className={`bg-gradient-to-r font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className={`font-medium transition-all duration-200 ${
                      isDarkMode 
                        ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    onClick={() => navigate("/sign-up")}
                  >
                    Sign Up
                  </Button>
                </>
              )
            )}

            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 ${
                isDarkMode
                  ? "bg-gray-800 text-yellow-400 hover:bg-gray-700 border-gray-600"
                  : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
              } border-2`}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className={`p-2 transition-all duration-200 ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t transition-all duration-300 ${
            isDarkMode 
              ? 'border-gray-700 bg-gray-900' 
              : 'border-gray-200 bg-white'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/about");
                }}
                className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 w-full text-left ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Info className="h-4 w-4 mr-2" />
                About Us
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/contact");
                }}
                className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 w-full text-left ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </button>
              <div className={`pt-2 border-t transition-all duration-300 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                {currentUser !== undefined && (
                  currentUser ? (
                    <Button
                      className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start font-medium transition-all duration-200 ${
                          isDarkMode 
                            ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate("/login");
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mt-2"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate("/sign-up");
                        }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )
                )}
                <button
                  onClick={toggleDarkMode}
                  className={`mt-4 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 ${
                    isDarkMode
                      ? "bg-gray-800 text-yellow-400 hover:bg-gray-700 border-gray-600"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
                  } border-2`}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
