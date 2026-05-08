import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          // warm graphite (stronger contrast, less washed-out)
          950: '#1E1C19',
          900: '#2A2622',
          800: '#3A332D',
          700: '#4A413A',
        },
        paper: {
          50: '#FFFEFB',
          100: '#FBF7EF',
          200: '#F3EBDD',
        },
        milk: {
          50: '#FAF6EE',
          100: '#F2EADD',
        },
        gold: {
          50: '#FFF7E6',
          100: '#FBE7B4',
          200: '#E4C98E',
          300: '#C6A062', // restrained premium gold
          400: '#B58B4D',
        },
        fog: {
          100: 'rgba(255,255,255,0.58)',
          200: 'rgba(255,255,255,0.42)',
          300: 'rgba(255,255,255,0.30)',
        },
      },
      boxShadow: {
        soft:
          '0 10px 28px rgba(30,28,25,0.10), 0 2px 8px rgba(30,28,25,0.06)',
        lift:
          '0 18px 44px rgba(30,28,25,0.14), 0 6px 18px rgba(30,28,25,0.10)',
        glowGold:
          '0 0 0 1px rgba(198,160,98,0.28), 0 12px 32px rgba(198,160,98,0.14)',
        insetGlass: 'inset 0 1px 0 rgba(255,255,255,0.55)',
      },
      borderRadius: {
        xl: '18px',
        '2xl': '22px',
        '3xl': '28px',
      },
      backdropBlur: {
        glass: '18px',
      },
      fontSize: {
        // small global readability lift for common utility sizes (non-breaking)
        xs: ['13px', { lineHeight: '18px' }],
        sm: ['15px', { lineHeight: '22px' }],
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Inter',
          'Roboto',
          'system-ui',
          'sans-serif',
        ],
      },
      letterSpacing: {
        tightish: '-0.015em',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-30%)' },
          '100%': { transform: 'translateX(30%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
