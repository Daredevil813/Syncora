"use client";

import { useState } from "react";
import Navbar from "@/components/navbar"
import "./rate.css"
import { useRouter } from 'next/navigation';
const RateUs = () => {
    const router = useRouter();
  const [rating, setRating] = useState(0);

  const handleStarClick = (value) => {
    setRating(value);
  };
  const redirectToHome = () => {
    router.push('/home'); 
  };

  return (
   <div>
    <Navbar/>
     <div className="flex items-center justify-center min-h-screen ">
      <div className="ratebox p-8 shadow-md rounded-md max-w-md w-full text-center">
        <h2 className="headText">How was your party?</h2>
        <div className="flex justify-center mb-4">
          {[1, 2, 3, 4, 5].map((starValue) => (
            <span
              key={starValue}
              className={`cursor-pointer text-4xl ${
                starValue <= rating ? "text-yellow-400" : "text-gray-400"
              }`}
              onClick={() => handleStarClick(starValue)}
            >
              &#9733;
            </span>
          ))}
        </div>
       <button onClick={redirectToHome} className="submitBtn">Submit</button>
      </div>
    </div>
   </div>
  );
};

export default RateUs;
