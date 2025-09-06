/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'whatsapp-green': '#056162',
        'whatsapp-gray': '#262d31',
        'whatsapp-dark': '#121212',
        'whatsapp-header': '#2a2a2a',
      },
    },
  },
  plugins: [],
}