import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import config from "../config/api";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState(""); // Used for success message in full-screen view
  const [errorMessage, setErrorMessage] = useState(""); // Used for inline errors
  const [token, setToken] = useState("");
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setErrorMessage("This password reset link is invalid or missing.");
    }
    
    setTimeout(() => setIsVisible(true), 100);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    
    if (!token) {
      setErrorMessage("Invalid reset token. Please request a new password reset.");
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password.length > 15) {
      setErrorMessage("Password must be 15 characters or less.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/users/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage("Password reset successful! You can now log in with your new password.");
      } else {
        setErrorMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#ffcb25]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#A23A56]/5 to-[#ffcb25]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative flex flex-col items-center justify-start min-h-screen px-4 pt-32 pb-8">
          <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-full flex items-center justify-center transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className={`mt-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-6">
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
                Password Reset Complete!
              </h1>
              <p className="text-lg text-white/80 leading-relaxed font-medium max-w-md mx-auto mb-4">
                {message}
              </p>
            </div>

            <div className="flex justify-center">
              <Link
                to="/auth"
                className="w-80 py-4 bg-gradient-to-r from-[#A23A56] to-[#B8456E] text-white rounded-xl font-bold text-lg hover:from-[#B8456E] hover:to-[#A23A56] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#A23A56] focus:ring-opacity-50 text-center"
              >
                Sign In with New Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#ffcb25]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#A23A56]/5 to-[#ffcb25]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex flex-col items-center justify-start min-h-screen px-4 pt-32 pb-12">
        <div className={`w-full transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
              Create New Password
            </h1>
            
            <p className="text-lg text-white/70 leading-relaxed font-medium max-w-md mx-auto">
              (Must be between 6 and 15 characters long)
            </p>
          </div>

          <div className="relative group max-w-md w-full mb-8 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-[#A23A56] to-[#ffcb25] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
            
            <form
              onSubmit={handleSubmit}
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 space-y-6"
            >
              <div>
                <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A23A56] focus:border-transparent focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(""); // Clear error on change
                  }}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A23A56] focus:border-transparent focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage(""); // Clear error on change
                  }}
                  required
                />
                
                {/* Inline Error Message */}
                {errorMessage && (
                  <p className="text-red-500 text-sm font-medium mt-2">
                    {errorMessage}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full py-4 bg-gradient-to-r from-[#A23A56] to-[#B8456E] text-white rounded-xl font-bold text-lg hover:from-[#B8456E] hover:to-[#A23A56] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#A23A56] focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Updating Password...
                  </div>
                ) : (
                  "Update Password"
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/auth"
                  className="text-[#A23A56] font-semibold hover:text-[#B8456E] transition-colors duration-300 underline decoration-2 underline-offset-2"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;