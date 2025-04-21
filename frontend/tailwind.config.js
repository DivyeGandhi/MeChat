/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme-specific colors
        theme: {
          light: {
            bg: '#ffffff',
            text: '#000000',
            primary: '#8a26a5', // New purple color
            secondary: '#6B7280',
            border: '#E5E7EB',
            hover: '#d998d3', // Light purple hover color
          },
          dark: {
            bg: '#1F2937',
            text: '#FFFFFF',
            primary: '#8a26a5', // New purple color
            secondary: '#9CA3AF',
            border: '#374151',
            hover: '#6d1e84', // Darker purple hover color
          },
          'high-contrast': {
            bg: '#000000',
            text: '#FFFFFF',
            primary: '#8a26a5', // New purple color
            secondary: '#D1D5DB',
            border: '#FFFFFF',
            hover: '#6d1e84', // Darker purple hover color
          },
        },
        purple: {
          primary: '#8a26a5',
          hover: '#d998d3', // Updated hover color for light mode
        },
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['dark', 'high-contrast'],
      textColor: ['dark', 'high-contrast'],
      borderColor: ['dark', 'high-contrast'],
      placeholderColor: ['dark', 'high-contrast'],
    },
  },
  plugins: [],
} 