/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#0b0f14',
          elevated: '#0f1418',
          accent: '#7C5CFF',
          accentGradient: 'linear-gradient(90deg, #7C5CFF 0%, #4FB3FF 100%)',
          secondary: '#00D4A2',
        },
        text: {
          primary: '#E6EEF3',
          secondary: '#A6B2BD',
          muted: '#54606B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        default: '12px',
        large: '20px',
      },
      boxShadow: {
        soft: '0 6px 30px rgba(0,0,0,0.6)',
      },
      animation: {
        'microbounce': 'microbounce 0.3s ease-in-out',
        'card-lift': 'card-lift 0.2s ease-out',
      },
      keyframes: {
        microbounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'card-lift': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}

