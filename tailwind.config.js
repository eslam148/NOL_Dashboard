/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // NOL Dashboard Custom Colors
        primary: {
          yellow: '#E4B63D',
          cream: '#FEFCE8',
          white: '#FFFFFF',
          dark: '#1E1E1E',
          gray: '#414042',
        },
        yellow: {
          50: '#FFFEF7',
          100: '#FEFCE8',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#E4B63D',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#414042',
          800: '#262626',
          900: '#1E1E1E',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
