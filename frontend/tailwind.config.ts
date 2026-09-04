import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e0f9ff',
          100: '#b3f0ff',
          200: '#80e7ff',
          300: '#4dddff',
          400: '#26d5ff',
          500: '#0ABDE3',
          600: '#009bbf',
          700: '#007899',
          800: '#005673',
          900: '#003450',
        },
        navy: {
          900: '#0A3D62',
          800: '#1a5276',
          700: '#2874a6',
        },
        cura: {
          bg: '#F8FAFB',
          card: '#FFFFFF',
          text: '#1A1A2E',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        input: '12px',
        pill: '50px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 20px rgba(10, 189, 227, 0.15)',
        nav: '0 -2px 16px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'cura-gradient': 'linear-gradient(135deg, #0ABDE3 0%, #0A3D62 100%)',
        'auth-gradient': 'linear-gradient(180deg, #e0f9ff 0%, #ffffff 60%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-dot': 'bounceDot 1.4s infinite ease-in-out both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
