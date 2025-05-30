/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'dash': 'dash 1s linear infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': {
            transform: 'scale(0.33)',
          },
          '40%, 50%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
            transform: 'scale(1.2)',
          },
        },
        'dash': {
          'to': {
            'stroke-dashoffset': '-10',
          },
        },
      },
    },
  },
  plugins: [],
} 