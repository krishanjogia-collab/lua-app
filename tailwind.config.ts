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
          50: '#FBF2F0',
          100: '#F6E4E0',
          200: '#EDCAC1',
          300: '#E4AFA3',
          400: '#DB9584',
          500: '#D27A65',
          600: '#A86251',
          700: '#7E493D',
          800: '#543128',
          900: '#2A1814',
          DEFAULT: '#D27A65'
        },
        sage: {
          50: '#F4F5F0',
          100: '#E8EAE0',
          200: '#D1D5C1',
          300: '#BAC1A2',
          400: '#A3AC83',
          500: '#8C9764',
          600: '#707950',
          700: '#545B3C',
          800: '#383C28',
          900: '#1C1E14',
          DEFAULT: '#8C9764'
        },
        cream: {
          50: '#FFFEFC',
          100: '#FFFEF9',
          200: '#FEFCF3',
          300: '#FEFBEE',
          400: '#FDF9E8',
          500: '#FDF8E2',
          600: '#CAC6B5',
          700: '#989588',
          800: '#65635A',
          900: '#33322D',
          DEFAULT: '#FDF8E2'
        },
        'deep-espresso': {
          50: '#EFEAE9',
          100: '#DED5D4',
          200: '#BEABA8',
          300: '#9D817D',
          400: '#7D5751',
          500: '#5C2D26',
          600: '#4A241E',
          700: '#371B17',
          800: '#25120F',
          900: '#120908',
          DEFAULT: '#5C2D26'
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
