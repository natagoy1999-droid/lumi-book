import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#090A0E',
          900: '#0E1016',
          800: '#141824',
          700: '#1B2030',
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
          200: '#EBCB7A',
          300: '#D6B25A',
          400: '#B8913E',
        },
        fog: {
          100: 'rgba(255,255,255,0.58)',
          200: 'rgba(255,255,255,0.42)',
          300: 'rgba(255,255,255,0.30)',
        },
      },
      boxShadow: {
        soft:
          '0 10px 28px rgba(10,12,16,0.10), 0 2px 8px rgba(10,12,16,0.06)',
        lift:
          '0 18px 44px rgba(10,12,16,0.14), 0 6px 18px rgba(10,12,16,0.10)',
        glowGold:
          '0 0 0 1px rgba(214,178,90,0.34), 0 12px 32px rgba(214,178,90,0.18)',
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

