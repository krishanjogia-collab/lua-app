import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#E2725B',
          50:  '#FDF3F1',
          100: '#FAE6E2',
          200: '#F4C9C2',
          300: '#EEA898',
          400: '#E8866F',
          500: '#E2725B',
          600: '#D4563E',
          700: '#B04430',
          800: '#8D3626',
          900: '#6E2A1D',
        },
        sage: {
          DEFAULT: '#8A9A5B',
          50:  '#F4F6EC',
          100: '#E8EDD8',
          200: '#D0DBB0',
          300: '#B8C988',
          400: '#A0B370',
          500: '#8A9A5B',
          600: '#6E7C48',
          700: '#566137',
          800: '#3E4628',
          900: '#272C19',
        },
        cream: {
          DEFAULT: '#FFFDD0',
          50:  '#FFFFF7',
          100: '#FFFEF0',
          200: '#FFFDE0',
          300: '#FFFDD0',
          400: '#FFFBC0',
          500: '#FFFAA8',
        },
        'dusty-rose': {
          DEFAULT: '#C08081',
          50:  '#F8EDED',
          100: '#F0DADA',
          200: '#E1B5B5',
          300: '#D29090',
          400: '#C08081',
          500: '#AA6667',
          600: '#8E4E4F',
          700: '#6E3B3C',
        },
      },
      fontFamily: {
        lexend: ['var(--font-lexend)', 'sans-serif'],
        inter:  ['var(--font-inter)',  'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        soft:    '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.03)',
        'soft-lg': '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
