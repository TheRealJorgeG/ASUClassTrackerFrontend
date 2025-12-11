import React from "react";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom"; 

const Card = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    // Navigate to /auth and pass state to set isLogin to false (show signup)
    navigate("/auth", { state: { isLogin: false } }); 
  };

  return (
    <div className="w-full py-[10rem] px-4">
      <div className="max-w-[1240px] mx-auto grid md:grid-cols-1 gap-8">
        {/* Removed hover:scale-105 and duration-300 to get rid of card hover effect */}
        <div className="w-full shadow-xl flex flex-col p-8 my-4 rounded-lg bg-white">
          <div className="mx-auto mt-[-3rem] bg-white rounded-full p-4">
            <CgProfile size={80} className="text-[#A23A56]" />
          </div>
          <h2 className="text-3xl font-bold text-center py-6 text-black">Single User</h2>
          <p className="text-center text-4xl font-bold text-black">Free</p>
          <div className="text-center font-medium mt-6 text-black">
            <p className="py-2 border-b mx-8">Track up to 3 classes</p>
            <p className="py-2 border-b mx-8">Email alerts</p>
            <p className="py-2 border-b mx-8">Instant notification</p>
          </div>
          <button
            onClick={handleGetStarted}
            // Updated button styles to match AuthPage button (gradient, shadow, animation)
            className="w-[200px] mx-auto my-6 py-4 bg-gradient-to-r from-[#A23A56] to-[#B8456E] text-white rounded-xl font-bold text-lg hover:from-[#B8456E] hover:to-[#A23A56] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#A23A56] focus:ring-opacity-50"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;