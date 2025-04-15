/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B4513', // Brown
          light: '#A67B5B',
          dark: '#6B3E0A',
        },
        secondary: {
          DEFAULT: '#1E1E1E', // Black
          light: '#2D2D2D',
          dark: '#121212',
        },
        accent: {
          DEFAULT: '#D4A76A', // Light Brown / Gold
          light: '#E6C38D',
          dark: '#C19456',
        },
        background: {
          light: '#F9F5F1',
          dark: '#211D1B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}