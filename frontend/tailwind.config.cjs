/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#667eea',
          dark: '#5568d3',
          gradient: '#764ba2',
        },
        sidebar: {
          bg: '#2c2c2c',
          hover: '#3a3a3a',
          active: '#4a4a4a',
        },
        message: {
          user: '#e3f2fd',
          assistant: '#f5f5f5',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-dots': 'bounceDots 1.4s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceDots: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.7' },
          '30%': { transform: 'translateY(-10px)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
