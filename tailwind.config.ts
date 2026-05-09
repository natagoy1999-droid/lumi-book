import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          // rich black + warm graphite (logo-inspired contrast; base UI stays light)
          950: '#111111',
          900: '#171717',
          800: '#2C2824',
          700: '#4A433C',
        },
        paper: {
          50: '#FFFDF8',
          100: '#FBF6EC',
          200: '#F3EBDD',
        },
        milk: {
          50: '#FAF6EE',
          100: '#F2EADD',
        },
        gold: {
          50: '#FCF9F3',
          100: '#F5EBD4',
          200: '#F1E1B8',
          300: '#D8B76D',
          400: '#C6A15B', // champagne gold anchor
          500: '#A68954',
        },
        fog: {
          100: 'rgba(255,255,255,0.58)',
          200: 'rgba(255,255,255,0.42)',
          300: 'rgba(255,255,255,0.30)',
        },
      },
      boxShadow: {
        soft:
          '0 10px 30px rgba(17,17,17,0.09), 0 2px 10px rgba(17,17,17,0.05)',
        lift:
          '0 20px 48px rgba(17,17,17,0.12), 0 8px 22px rgba(17,17,17,0.08)',
        glowGold:
          '0 0 0 1px rgba(198,161,91,0.42), 0 10px 32px rgba(198,161,91,0.18), 0 16px 44px rgba(23,23,23,0.07)',
        heroGold:
          '0 0 0 1.5px rgba(198,161,91,0.55), 0 8px 28px rgba(198,161,91,0.22), 0 22px 52px rgba(23,23,23,0.09)',
        luxury:
          'inset 0 1px 0 rgba(255,255,255,0.98), 0 14px 40px rgba(23,23,23,0.075), 0 6px 22px rgba(198,161,91,0.12), 0 0 0 1px rgba(198,161,91,0.32)',
        'luxury-md':
          'inset 0 1px 0 rgba(255,255,255,0.96), 0 20px 50px rgba(23,23,23,0.085), 0 8px 26px rgba(198,161,91,0.14), 0 0 0 1px rgba(198,161,91,0.38)',
        dock:
          '0 -12px 44px rgba(23,23,23,0.11), 0 -4px 18px rgba(198,161,91,0.14), inset 0 1px 0 rgba(255,253,248,0.98)',
        insetGlass: 'inset 0 1px 0 rgba(255,255,255,0.55)',
      },
      borderRadius: {
        xl: '18px',
        '2xl': '22px',
        '3xl': '30px',
        '4xl': '32px',
      },
      backdropBlur: {
        glass: '18px',
      },
      fontSize: {
        xs: ['14px', { lineHeight: '20px' }],
        sm: ['15px', { lineHeight: '22px' }],
        base: ['17px', { lineHeight: '26px' }],
        lg: ['19px', { lineHeight: '30px' }],
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
