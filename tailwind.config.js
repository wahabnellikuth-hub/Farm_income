/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          green: {
            50: '#f2fbf5',
            100: '#e1f6e8',
            200: '#c3ecd4',
            300: '#94ddb6',
            400: '#5fc390',
            500: '#3ba571',
            600: '#2a8458',
            700: '#236948',
            800: '#1f533a',
            900: '#1a4431',
          },
          brown: {
            50: '#fdf8f6',
            100: '#f2e8e5',
            200: '#eaddd8',
            300: '#e0cec7',
            400: '#d2bab0',
            500: '#a18072',
            600: '#977669',
            700: '#846358',
            800: '#43302b',
            900: '#2c1f1c',
          },
        }
      }
    },
  },
  plugins: [],
}
