import React from 'react';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-3">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1a3a6b] rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-gray-500 tracking-wide animate-pulse">
        Memuat data...
      </p>
    </div>
  );
};

export default Loading;