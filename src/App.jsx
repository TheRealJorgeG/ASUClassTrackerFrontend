import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"; 

// Components
import Navbar from "./components/Navbar";
import Villain from "./components/Villain";
import Analytics from "./components/Analytics";
import Card from "./components/Card";
import AuthPage from "./components/AuthPage";
import ClassesPage from "./components/ClassesPage"; 
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import VerifyEmail from "./components/VerifyEmail";
import AwaitingVerification from "./components/AwaitingVerification";
import Modal from "./components/Modal"; 

// Utils
import { decodeJwt } from "./utils/decodeJwt";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  const logoutUser = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null); // Explicitly clear user here to force re-render
  };

  // This function now handles the actual logout
  const handleCloseModal = () => {
    setShowSessionExpired(false);
    logoutUser(); // Logout only AFTER user clicks "Okay"
  };

  // 1. Initial Load Check
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const decoded = decodeJwt(storedToken);
      const currentTime = Date.now() / 1000;

      // Check for token expiration
      if (decoded && decoded.exp && decoded.exp < currentTime) {
        console.log("Token expired on load.");
        setShowSessionExpired(true); 
        // We do NOT logout here. We allow the code to proceed 
        // and set the user so the background page renders.
      }

      if (decoded && decoded.user && decoded.user.email) {
        setToken(storedToken);
        setUser(decoded.user);
      } else {
        localStorage.removeItem("token");
      }
    }
  }, []);

  // 2. Interval Check
  useEffect(() => {
    let intervalId;
    
    if (token) {
      const decoded = decodeJwt(token);
      // Defensive check
      if (decoded?.user && !user) {
        setUser(decoded.user);
      }

      const EXPIRATION_CHECK_INTERVAL = 60000; 
      
      const checkExpiration = () => {
        if (!decoded || !decoded.exp) return;

        const currentTime = Date.now() / 1000;
        const expirationTime = decoded.exp;
        
        if (expirationTime < currentTime) {
          console.log("Token expired during session.");
          clearInterval(intervalId); 
          setShowSessionExpired(true); // Show Modal
          // Do NOT logoutUser() here. 
          // Keeping 'user' state active keeps ClassesPage visible.
        }
      };
      
      checkExpiration();
      intervalId = setInterval(checkExpiration, EXPIRATION_CHECK_INTERVAL);
      
    } else {
      // If no token, ensure user is null
      if (user) setUser(null);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [token, user]);

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(to bottom, #A23A56 0%, #92223D 25%, #6b1a2f 50%, #92223D 75%, #A23A56 100%)'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-900/10 to-yellow-900/10"></div>
      
      {/* Modal is rendered here, overlaying whatever page is currently valid */}
      <Modal 
        isOpen={showSessionExpired} 
        onClose={handleCloseModal} 
        title="Session Expired" 
        message="Your session has timed out for security reasons. Please log in again."
        type="error"
      />

      <Router>
        <ScrollToTop /> 
        <div className="relative z-10">
          <Navbar user={user} handleLogout={logoutUser} />
          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  <ClassesPage />
                ) : (
                  <>
                    <Villain />
                    <Analytics />
                    <Card />
                  </>
                )
              }
            />
            <Route path="/auth" element={<AuthPage setToken={setToken} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/awaiting-verification" element={<AwaitingVerification />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;