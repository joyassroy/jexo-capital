import React from "react";

export default function CityFooter() {
  return (
    <div className="relative w-full h-24 overflow-hidden mt-auto pointer-events-none">
      {/* City skyline silhouettes */}
      <svg
        viewBox="0 0 500 120"
        preserveAspectRatio="none"
        className="w-full h-full opacity-80"
      >
        <defs>
          <linearGradient id="cityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="waterReflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Skyline building shapes */}
        <polygon
          points="
            0,120 0,90 20,90 20,70 30,70 30,55 35,30 40,55 45,70 55,70 55,95 
            70,95 70,60 85,60 85,85 100,85 100,45 110,45 110,35 115,20 120,35 125,45 135,45 135,90 
            160,90 160,65 175,65 175,80 190,80 190,50 200,50 200,40 205,15 210,40 215,50 230,50 230,95 
            260,95 260,70 275,70 275,85 290,85 290,55 305,55 305,90 
            330,90 330,40 340,40 345,10 350,40 360,40 360,80 380,80 380,60 395,60 395,95 
            420,95 420,50 435,50 435,75 450,75 450,65 460,65 465,30 470,65 480,65 480,95 500,95 500,120
          "
          fill="url(#cityGrad)"
        />

        {/* Water reflection ripples */}
        <rect x="0" y="98" width="500" height="22" fill="url(#waterReflection)" />
        <line x1="10" y1="102" x2="80" y2="102" stroke="#e0f2fe" strokeWidth="1" opacity="0.6" />
        <line x1="120" y1="105" x2="220" y2="105" stroke="#e0f2fe" strokeWidth="1.5" opacity="0.8" />
        <line x1="260" y1="103" x2="340" y2="103" stroke="#e0f2fe" strokeWidth="1" opacity="0.6" />
        <line x1="370" y1="106" x2="480" y2="106" stroke="#e0f2fe" strokeWidth="1.2" opacity="0.7" />
      </svg>
    </div>
  );
}

