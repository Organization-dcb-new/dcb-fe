/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        '4k': '2561px',
        '5k': '3000px',
      },
    },
  },
  plugins: [],
}
