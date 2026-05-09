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
          50: '#FFFDFB',
          100: '#FBF7EF',
          200: '#F3EBDD',
        },
        milk: {
          50: '#FAF6EE',
          100: '#F2EADD',
        },
        gold: {
          50: '#FCF9F3',
          100: '#F0E6D4',
          200: '#D9C49A',
          300: '#C6A56A', // muted champagne gold
          400: '#A68954',
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
          '0 0 0 1px rgba(198,165,106,0.28), 0 10px 36px rgba(198,165,106,0.11)',
        luxury:
          'inset 0 1px 0 rgba(255,255,255,0.92), 0 10px 32px rgba(17,17,17,0.07), 0 0 0 1px rgba(198,165,106,0.18)',
        'luxury-md':
          'inset 0 1px 0 rgba(255,255,255,0.88), 0 14px 40px rgba(17,17,17,0.09), 0 0 0 1px rgba(198,165,106,0.24)',
        dock: '0 -12px 40px rgba(17,17,17,0.08), 0 -1px 0 rgba(198,165,106,0.12)',
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
        xs: ['13px', { lineHeight: '18px' }],
        sm: ['15px', { lineHeight: '22px' }],
        base: ['17px', { lineHeight: '26px' }],
        lg: ['18px', { lineHeight: '28px' }],
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
