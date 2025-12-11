import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../config/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const hasVerified = useRef(false); // Prevent double execution

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent running twice in strict mode
      if (hasVerified.current) {
        console.log('⏭️ Already verified, skipping...');
        return;
      }
      
      const token = searchParams.get('token');
      
      console.log('=== EMAIL VERIFICATION START ===');
      console.log('Token from URL:', token);
      
      if (!token) {
        console.log('❌ No token found');
        setStatus('error');
        setMessage('No verification token found in URL');
        return;
      }

      hasVerified.current = true; // Mark as verified

      try {
        const url = `${config.API_BASE_URL}/api/users/verify-email/${token}`;
        console.log('📤 Making request to:', url);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        
        const data = await response.json();
        console.log('📥 Response data:', data);

        if (response.ok) {
          console.log('✅ Verification SUCCESS');
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          console.log('❌ Verification FAILED');
          setStatus('error');
          setMessage(data.message || 'Verification failed. Please try again.');
        }
      } catch (error) {
        console.error('❌ Verification ERROR:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
      
      console.log('=== EMAIL VERIFICATION END ===');
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#ffcb25]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#A23A56]/5 to-[#ffcb25]/5 rounded-full blur-3xl"></div>
      </div>

      {/* UPDATED LINE BELOW:
         1. Changed 'justify-center' to 'justify-start' (aligns content to top)
         2. Changed 'py-12' to 'pt-32 pb-12' (adds space at the top so it isn't stuck to the edge)
      */}
      <div className="relative flex flex-col items-center justify-start min-h-screen px-4 pt-32 pb-12">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-white/20 border-t-[#ffcb25] rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-3xl font-bold text-white mb-3">Verifying your email...</h2>
            <p className="text-white/70 text-lg">Please wait while we verify your ASU email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-[#ffcb25] mb-4">Email Verified!</h2>
            <p className="text-white/80 text-lg mb-4">{message}</p>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-white/70 text-sm">
                You can now close this tab and return to the application.
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-red-400 mb-4">Verification Failed</h2>
            <p className="text-white/80 text-lg mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/auth')}
                className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/auth', { state: { isLogin: false } })}
                className="bg-gradient-to-r from-[#A23A56] to-[#B8456E] text-white px-6 py-3 rounded-xl font-bold hover:from-[#B8456E] hover:to-[#A23A56] transform hover:scale-105 transition-all duration-300"
              >
                Register Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;