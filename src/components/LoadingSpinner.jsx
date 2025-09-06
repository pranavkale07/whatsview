import React from 'react';

/**
 * Loading Spinner Component
 * Reusable loading indicator
 */
const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  showText = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}
      ></div>
      {showText && text && (
        <span className="text-gray-600 dark:text-gray-400">{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
