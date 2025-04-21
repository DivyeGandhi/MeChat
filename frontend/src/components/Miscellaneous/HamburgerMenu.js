import React from 'react';

const HamburgerMenu = ({ onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
        >
            <div className="w-6 h-0.5 bg-gray-600 mb-1.5"></div>
            <div className="w-6 h-0.5 bg-gray-600 mb-1.5"></div>
            <div className="w-6 h-0.5 bg-gray-600"></div>
        </button>
    );
};

export default HamburgerMenu; 