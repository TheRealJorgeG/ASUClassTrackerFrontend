import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../config/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('No verification token found in URL');
        return;
      }

      try {
        const response = await fetch(
          `${config.API_BASE_URL}/api/users/verify-email/${token}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorations - matching your existing style */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#ffcb25]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#A23A56]/5 to-[#ffcb25]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12">
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
            <p className="text-white/60 text-sm mb-6">Redirecting you to login in 3 seconds...</p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-[#A23A56] to-[#B8456E] text-white px-8 py-3 rounded-xl font-bold hover:from-[#B8456E] hover:to-[#A23A56] transform hover:scale-105 transition-all duration-300"
            >
              Go to Login Now
            </button>
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
                onClick={() => navigate('/resend-verification')}
                className="bg-gradient-to-r from-[#A23A56] to-[#B8456E] text-white px-6 py-3 rounded-xl font-bold hover:from-[#B8456E] hover:to-[#A23A56] transform hover:scale-105 transition-all duration-300"
              >
                Resend Verification
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;