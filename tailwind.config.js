/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mtg: {
          bg: '#0F1117',
          surface: '#1A1D26',
          card: '#222634',
          border: '#2E3446',
          accent: '#FF6B00',
          accentHover: '#FF8533',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
          gold: '#F59E0B',
          white: '#F8FAFC',
          blue: '#3B82F6',
          black: '#1E293B',
          red: '#EF4444',
          green: '#10B981'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
