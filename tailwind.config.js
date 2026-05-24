/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#5BB89A',
        amber: '#F59E0B',
        cream: '#FFFBF0',
        sky: '#87CEEB',
        sand: '#F7F3E9',
        line: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Nunito', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.08)',
      },
      maxWidth: {
        app: '480px',
      },
    },
  },
  plugins: [],
};
