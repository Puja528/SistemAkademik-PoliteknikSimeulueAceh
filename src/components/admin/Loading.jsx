import React from 'react';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-3 animate-fadeIn">
      {/* Menggunakan spinner bawaan DaisyUI dengan pewarnaan tema portal */}
      <span className="loading loading-spinner w-12 text-[#1a3a6b]"></span>
      
      <p className="text-xs font-bold text-slate-400 tracking-wider uppercase animate-pulse">
        Memuat data...
      </p>
    </div>
  );
};

export default Loading;