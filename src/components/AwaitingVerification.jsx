import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../config/api';

const AwaitingVerification = ({ setToken }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email and password from location state (passed from registration)
  const email = location.state?.email || '';
  const password = location.state?.password || '';

  useEffect(() => {
    if (!email) {
      // If no email in state, redirect to auth
      navigate('/auth');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  // Poll to check if user has verified (check every 3 seconds)
  useEffect(() => {
    if (!email || !password) {
      console.log('❌ Missing email or password in state');
      navigate('/auth');
      return;
    }

    const checkVerificationAndLogin = async () => {
      try {
        console.log('🔍 Checking if user is verified...');
        
        // Try to login - this will only work if email is verified
        const loginResponse = await fetch(`${config.API_BASE_URL}/api/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          console.log('✅ Email verified! Login successful!');
          
          // Store token
          localStorage.setItem('token', data.accessToken);
          
          // Update App.jsx state
          if (setToken) {
            setToken(data.accessToken);
          }
          
          console.log('🎉 Redirecting to dashboard...');
          
          // Redirect to home
          window.location.href = '/';
        } else {
          console.log('⏳ Still waiting for verification...');
        }
      } catch (error) {
        console.log('⏳ Checking again...');
      }
    };

    // Check immediately on mount
    checkVerificationAndLogin();
    
    // Then check every 3 seconds
    const interval = setInterval(checkVerificationAndLogin, 3000);
    return () => clearInterval(interval);
  }, [email, password, navigate, setToken]);

  const handleResendEmail = async () => {
    if (!canResend) return;

    setIsChecking(true);
    setResendStatus('');

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/users/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setResendStatus('success');
        setCanResend(false);
        setCountdown(60);
        
        // Restart countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setResendStatus(data.message || 'Failed to resend email');
      }
    } catch (error) {
      setResendStatus('Network error. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#ffcb25]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#A23A56]/5 to-[#ffcb25]/5 rounded-full blur-3xl"></div>
      </div>

      {/* UPDATED LINE BELOW: 
          Changed 'justify-center' to 'justify-start' 
          Changed 'py-12' to 'pt-32 pb-12' (Adjust pt-32 to move it up or down)
      */}
      <div className="relative flex flex-col items-center justify-start min-h-screen px-4 pt-32 pb-12">
        <div className="max-w-md w-full">
          

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
              Check Your Email
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed font-medium mb-2">
              We've sent a verification link to
            </p>
            
            <p className="text-xl text-[#ffcb25] font-bold mb-4">
              {email}
            </p>
          </div>

          {/* Status Card */}
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-[#A23A56] to-[#ffcb25] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
            
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 space-y-6">
              {/* Auto-checking indicator */}
              <div className="flex items-center justify-center gap-3 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  Waiting for verification...
                </span>
              </div>

              {/* Instructions */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#A23A56]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#A23A56] font-bold text-xs">1</span>
                  </div>
                  <p>Open the email from <strong>ASU Class Tracker</strong></p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#A23A56]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#A23A56] font-bold text-xs">2</span>
                  </div>
                  <p>Click the <strong>"Verify Email Address"</strong> button</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#A23A56]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#A23A56] font-bold text-xs">3</span>
                  </div>
                  <p>You'll be automatically signed in here!</p>
                </div>
              </div>

              {/* Resend Email Section */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3 text-center">
                  Didn't receive the email?
                </p>
                
                {resendStatus === 'success' && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 text-center">
                      ✓ Verification email sent!
                    </p>
                  </div>
                )}

                {resendStatus && resendStatus !== 'success' && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 text-center">
                      {resendStatus}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleResendEmail}
                  disabled={!canResend || isChecking}
                  className="w-full py-3 bg-gradient-to-r from-[#A23A56] to-[#B8456E] text-white rounded-xl font-semibold hover:from-[#B8456E] hover:to-[#A23A56] transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isChecking ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : canResend ? (
                    'Resend Verification Email'
                  ) : (
                    `Resend available in ${countdown}s`
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Additional Help */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Trouble Finding the Email?</h3>
                <p className="text-white/70 text-sm">
                  Check your spam or junk folder. The verification link expires in 15 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwaitingVerification;