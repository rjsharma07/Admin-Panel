"use client";

import { useState } from "react";

interface ScratchCardProps {
  amount: string;
  onReveal: () => void;
}

export default function ScratchCard({ amount, onReveal }: ScratchCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      onReveal();
    }
  };

  return (
    <div 
      onClick={handleReveal}
      className={`relative w-full h-44 rounded-3xl cursor-pointer overflow-hidden transition-all duration-700 group ${
        isRevealed ? "scale-100 shadow-2xl shadow-indigo-100/50" : "hover:scale-[1.01] shadow-lg shadow-slate-200/50"
      }`}
    >
      {/* Revealed State */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-400 via-yellow-200 to-orange-400 p-6 text-center transition-all duration-1000 ease-out ${
        isRevealed ? "opacity-100 scale-100" : "opacity-0 scale-110"
      }`}>
        <div className="absolute inset-0 opacity-40 pointer-events-none">
           <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,_white_1.5px,_transparent_1.5px)] bg-[size:24px_24px]"></div>
        </div>
        
        <div className="relative">
          <p className="text-amber-900/40 text-[10px] font-black uppercase tracking-[0.4em] mb-2 animate-bounce">Reward Unlocked</p>
          <div className="text-6xl font-black text-amber-950 tracking-tighter drop-shadow-xl flex items-start justify-center">
            {amount}
          </div>
          <div className="mt-5 px-5 py-2 bg-white/40 backdrop-blur-xl rounded-2xl text-[11px] font-black text-amber-950 border border-white/60 uppercase tracking-widest shadow-sm">
            Policy Contributor Bonus
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-12 h-12 border-2 border-white/20 rounded-full animate-ping opacity-20"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border border-white/30 rounded-full animate-pulse opacity-20"></div>
      </div>

      {/* Unscratched Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
        isRevealed ? "opacity-0 invisible scale-150 rotate-6" : "opacity-100 visible scale-100 rotate-0"
      }`}>
        {/* Shimmer Effect */}
        <div className="absolute inset-0 w-[300%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full rotate-45 animate-[shimmer_4s_infinite] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center mb-4 border border-white/40 group-hover:scale-115 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-slate-400/20">
            <svg className="w-10 h-10 text-slate-500 group-hover:text-slate-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-slate-600 font-black text-xs uppercase tracking-[0.3em]">Scratch Card</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Click to reveal reward</p>
          </div>
        </div>
      </div>
    </div>
  );
}
