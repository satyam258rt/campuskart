import React from 'react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex justify-center items-center p-4 ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm animate-pulse flex flex-col gap-3">
    <div className="w-full h-48 bg-slate-200 rounded-xl"></div>
    <div className="w-2/3 h-5 bg-slate-200 rounded"></div>
    <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
      <div className="w-1/3 h-6 bg-slate-200 rounded"></div>
      <div className="w-1/4 h-8 bg-slate-100 rounded-lg"></div>
    </div>
  </div>
);

export default LoadingSpinner;
