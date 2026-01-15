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
import { useState, useEffect } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router";
import { auth, checkFirebaseConfig } from "@/lib/firebase";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { logger } from "@/utils/logger";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check Firebase configuration on component mount
  useEffect(() => {
    const config = checkFirebaseConfig();
    if (!config.authInitialized) {
      logger.error("Firebase Authentication is not properly initialized");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!auth) {
      logger.error("Firebase Authentication is not properly initialized");
      setError("Authentication is not configured. Please contact support.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);
      logger.info("Attempting to send password reset email", { email });
      
      await sendPasswordResetEmail(auth, email);
      
      logger.info("Password reset email sent successfully", { email });
      setSuccess("Password reset email sent! Please check your inbox.");
      setEmail("");
    } catch (error: any) {
      logger.error("Password reset error", { error, email });
      setError(`Failed to send reset email: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Show disabled state if Firebase is not configured
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
                Submit
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
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent animate-in slide-in-from-bottom duration-500">
              Forgot your Password?
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-lg animate-in slide-in-from-bottom duration-500 delay-100">
              Password reset instructions will be sent to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom duration-500 delay-200">
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

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in slide-in-from-top duration-300">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in slide-in-from-top duration-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-base transition-all duration-200 shadow-lg hover:shadow-xl animate-in slide-in-from-bottom duration-500 delay-300 hover:scale-[1.02] hover:-translate-y-0.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
            </form>

            {/* Navigation Links */}
            <div className="space-y-4 pt-4 animate-in slide-in-from-bottom duration-500 delay-400">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Remember your password?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors hover:underline underline-offset-2"
                  >
                    Sign In
                  </button>
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={() => navigate("/sign-up")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors hover:underline underline-offset-2"
                >
                  Don't have an account? Sign Up
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Section */}
        <div className="text-center animate-in slide-in-from-bottom duration-500 delay-500">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Legal</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By requesting a password reset, you agree to our{" "}
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