import React, { useEffect, useState } from 'react';

const Modal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      // Changed from 200ms to 100ms for a faster exit
      setTimeout(() => setShow(false), 100);
    }
  }, [isOpen]);

  if (!show && !isOpen) return null;

  return (
    <div 
      // Changed duration-200 to duration-100
      className={`fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 transition-all duration-100 ${
        isOpen ? 'bg-black/60 backdrop-blur-sm opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div 
        // Changed duration-200 to duration-100
        className={`relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-100 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#A23A56] to-[#ffcb25]"></div>

        <div className="p-8 text-center">
          {/* Icon Circle */}
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
              type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {type === 'success' ? (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-[#A23A56]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">
            {title}
          </h3>

          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            {message}
          </p>

          <button
            onClick={onClose}
            // Button transition can remain slightly smoother (300ms) or be matched to 100ms if preferred
            className="w-full py-3.5 bg-[#92223D] hover:bg-[#6b1a2f] text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
          >
            Okay, Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;