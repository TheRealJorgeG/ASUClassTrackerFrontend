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
        <div className="w-full shadow-xl flex flex-col p-8 my-4 rounded-lg bg-white hover:scale-105 duration-300">
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
            className="bg-[#A23A56] w-[200px] rounded-md font-medium my-6 mx-auto px-6 py-3 text-white"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;