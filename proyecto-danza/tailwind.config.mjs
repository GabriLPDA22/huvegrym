/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'background-main': '#1a1816',
        'text-main': '#e5e2de',
        'accent-primary': '#a39a8e',
      },
      fontFamily: {
        'serif': ['"Playfair Display"', 'serif'],
        'sans': ['"Inter"', 'sans-serif'],
        'bebas': ['"Bebas Neue"', 'sans-serif'],
        'oswald': ['"Oswald"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
