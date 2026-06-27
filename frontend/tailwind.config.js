/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Dark Mode Base System (re-mapped to light mode for uniform theme)
        bgDark: '#FFFFFF',
        surfaceDark: '#FFFFFF',
        cardDark: '#FFFFFF',
        borderDark: 'rgba(0,0,0,0.06)',
        
        // Light Mode Base System
        bgLight: '#FFFFFF',
        surfaceLight: '#FFFFFF',
        cardLight: '#FFFFFF',
        borderLight: 'rgba(0,0,0,0.06)',
        
        // Brand & Palette (Exact User Color #009A8E)
        primary: {
          DEFAULT: '#009A8E', // User exact Teal-Emerald
          hover: '#007A70',
        },
        secondary: {
          DEFAULT: '#00BFA9', // Lighter Teal-Emerald Accent
          hover: '#009A8E',
        },
        purple: {
          DEFAULT: '#008479', // Deep Teal Accent
          hover: '#006E64',
        },
        accent: '#009A8E',
        success: '#009A8E',
        warning: '#F59E0B',
        danger: '#EF4444',
        
        // Text System
        textPrimaryDark: '#0F172A',
        textSecondaryDark: '#475569',
        mutedDark: '#94A3B8',
        
        textPrimaryLight: '#0F172A',
        textSecondaryLight: '#475569',
        mutedLight: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'premium-light': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        'primary-glow': '0 4px 20px -2px rgba(79, 124, 255, 0.4)',
        'secondary-glow': '0 4px 20px -2px rgba(124, 92, 255, 0.4)',
      },
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('body-light', 'body.light &');
    }
  ],
}
