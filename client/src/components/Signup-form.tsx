import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { useNavigate } from "react-router";
import {
  auth,
  googleProvider,
  githubProvider,
} from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!auth) {
      setError("Authentication is not configured. Please contact support.");
      return;
    }

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Account created successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: any, providerName: string) => {
    if (!auth) {
      setError("Authentication is not configured. Please contact support.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await signInWithPopup(auth, provider);
      setSuccess(`${providerName} signup successful!`);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      setError(`${providerName} signup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!auth) {
    return (
      <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-xl flex-col gap-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Unavailable</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Firebase authentication is not configured. Please contact support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                disabled
              >
                Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full flex-col gap-6" style={{ maxWidth: '600px', minWidth: '400px' }}>
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 backdrop-blur-sm animate-in fade-in duration-500">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent animate-in slide-in-from-bottom duration-500">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-lg animate-in slide-in-from-bottom duration-500 delay-100">
              Sign up to get started with your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Social Signup Buttons */}
              <div className="space-y-4">
                {/* Primary Social Options - Most Popular */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-4 animate-in slide-in-from-top duration-500 delay-200">
                    Quick Sign Up
                  </h3>
                  
                  {/* Google - Primary Option */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-14 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 font-semibold text-base shadow-sm hover:shadow-lg animate-in slide-in-from-left duration-500 delay-300 hover:scale-[1.02] hover:-translate-y-1"
                    onClick={() => handleSocialSignup(googleProvider, "Google")}
                    disabled={isLoading}
                  >
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  {/* GitHub - Secondary Option */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-14 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white dark:text-gray-200 border-2 border-gray-900 dark:border-gray-600 hover:border-gray-700 dark:hover:border-gray-500 transition-all duration-300 font-semibold text-base shadow-sm hover:shadow-lg animate-in slide-in-from-left duration-500 delay-400 hover:scale-[1.02] hover:-translate-y-1"
                    onClick={() => handleSocialSignup(githubProvider, "GitHub")}
                    disabled={isLoading}
                  >
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Continue with GitHub
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-8 animate-in slide-in-from-bottom duration-500 delay-1200">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">or continue with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <div className="space-y-4 animate-in slide-in-from-bottom duration-500 delay-1100">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2 animate-in slide-in-from-top duration-300">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Password strength:</span>
                        <span className={`font-medium ${passwordStrength >= 75 ? 'text-green-600 dark:text-green-400' : passwordStrength >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className={`flex items-center space-x-1 ${password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                          {password.length >= 8 ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                          {/[a-z]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          <span>Lowercase</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                          {/[A-Z]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          <span>Uppercase</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                          {/[0-9]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          <span>Number</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className="flex items-center space-x-2 text-xs animate-in slide-in-from-top duration-300">
                      {password === confirmPassword ? (
                        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>Passwords match</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>Passwords do not match</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in slide-in-from-top duration-300">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in slide-in-from-top duration-300">
                    <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-base transition-all duration-200 shadow-lg hover:shadow-xl animate-in slide-in-from-bottom duration-500 delay-1200 hover:scale-[1.02] hover:-translate-y-0.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>

            {/* Navigation Links */}
            <div className="space-y-4 pt-4 animate-in slide-in-from-bottom duration-500 delay-1300">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors hover:underline underline-offset-2"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Section */}
        <div className="text-center animate-in slide-in-from-bottom duration-500 delay-1400">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Legal</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline hover:underline-offset-2 transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline hover:underline-offset-2 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}