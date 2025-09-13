import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <style>
        {`
          @keyframes pulse-bar {
            0%, 100% {
              transform: scaleY(0.2);
            }
            50% {
              transform: scaleY(1);
            }
          }
          .pulse-bar {
            animation: pulse-bar 1.2s infinite ease-in-out;
          }
        `}
      </style>
      <div className="flex items-center justify-center space-x-2">
        <div className="pulse-bar h-16 w-3 bg-gradient-to-b from-purple-500 to-pink-500 rounded-lg" style={{ animationDelay: '0s' }}></div>
        <div className="pulse-bar h-16 w-3 bg-gradient-to-b from-purple-500 to-pink-500 rounded-lg" style={{ animationDelay: '0.1s' }}></div>
        <div className="pulse-bar h-16 w-3 bg-gradient-to-b from-purple-500 to-pink-500 rounded-lg" style={{ animationDelay: '0.2s' }}></div>
        <div className="pulse-bar h-16 w-3 bg-gradient-to-b from-purple-500 to-pink-500 rounded-lg" style={{ animationDelay: '0.3s' }}></div>
        <div className="pulse-bar h-16 w-3 bg-gradient-to-b from-purple-500 to-pink-500 rounded-lg" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};