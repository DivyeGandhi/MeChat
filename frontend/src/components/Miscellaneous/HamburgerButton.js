import React from 'react';

const HamburgerButton = ({ onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 theme-high-contrast:bg-black border border-gray-200 dark:border-gray-700 theme-high-contrast:border-white"
        >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300 theme-high-contrast:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    );
};

export default HamburgerButton; 