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
            primary: '#10B981', // Green
            secondary: '#6B7280',
            border: '#E5E7EB',
          },
          dark: {
            bg: '#1F2937',
            text: '#FFFFFF',
            primary: '#8B5CF6', // Purple
            secondary: '#9CA3AF',
            border: '#374151',
          },
          'high-contrast': {
            bg: '#000000',
            text: '#FFFFFF',
            primary: '#F59E0B', // Yellow
            secondary: '#D1D5DB',
            border: '#FFFFFF',
          },
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