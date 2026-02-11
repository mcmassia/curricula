import React from 'react';

interface ProgressBarProps {
    progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    return (
        <div className="relative w-full bg-gray-800 rounded-full h-4 border border-gray-700">
            <div 
                className="bg-gray-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
            <span className="absolute w-full text-center text-xs font-semibold text-gray-200 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {Math.round(progress)}%
            </span>
        </div>
    );
};