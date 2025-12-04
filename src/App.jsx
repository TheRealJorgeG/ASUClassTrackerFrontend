import React, { useState, useEffect } from "react";
// Import useLocation from react-router-dom for ScrollToTop
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"; 

import Navbar from "./components/Navbar";
import Villain from "./components/Villain";
import Analytics from "./components/Analytics";
import Card from "./components/Card";
import AuthPage from "./components/AuthPage";
import ClassesPage from "./components/ClassesPage"; 
import { decodeJwt } from "./utils/decodeJwt";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import VerifyEmail from "./components/VerifyEmail";

// Component to force scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top of the page on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  // Centralized logout function for Navbar and automatic expiry
  const logoutUser = () => {
    localStorage.removeItem("token");
    setToken("");
    // setUser(null) is handled by the useEffect below
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const decoded = decodeJwt(storedToken);
      const currentTime = Date.now() / 1000;

      // Check for token expiration immediately on load
      if (decoded && decoded.exp && decoded.exp < currentTime) {
        console.log("Token expired on load. Logging out.");
        logoutUser();
        return;
      }

      if (decoded && decoded.user && decoded.user.email) {
        setToken(storedToken);
        setUser(decoded.user);
      } else {
        // If token is present but decoding failed (e.g., bad format or missing user field)
        localStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    let intervalId;
    
    if (token) {
      const decoded = decodeJwt(token);
      setUser(decoded.user);

      const EXPIRATION_CHECK_INTERVAL = 60000; // Check every 1 minute (60 seconds)
      
      const checkExpiration = () => {
        const currentTime = Date.now() / 1000; // current time in seconds
        const expirationTime = decoded.exp; // Assuming 'exp' is in seconds since epoch
        
        // Log out if expiration is passed
        if (expirationTime && expirationTime < currentTime) {
          console.log("Token expired during session. Logging out.");
          clearInterval(intervalId); 
          logoutUser();
        }
      };
      
      // Check expiration immediately and then set up periodic check
      checkExpiration();
      intervalId = setInterval(checkExpiration, EXPIRATION_CHECK_INTERVAL);
      
    } else {
      setUser(null);
    }
    
    // Cleanup function to clear the interval when component unmounts or token changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [token]);

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(to bottom, #A23A56 0%, #92223D 25%, #6b1a2f 50%, #92223D 75%, #A23A56 100%)'
      }}
    >
      {/* Gradient overlays for extra depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-900/10 to-yellow-900/10"></div>
      
      <Router>
        <ScrollToTop /> {/* Render ScrollToTop here to automatically scroll to the top */}
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
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;