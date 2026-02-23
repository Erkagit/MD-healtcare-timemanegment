/** @type {import('tailwindcss').Config} */
const sharedConfig = require('@clinic/config/tailwind.config');

module.exports = {
  ...sharedConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...sharedConfig.theme.extend,
      // Admin-specific design tokens — aligned with public site brand
      colors: {
        ...sharedConfig.theme.extend.colors,
        // Primary – Brand Teal (from MD Health Care logo)
        blush: {
          50: '#f0fdfc',
          100: '#ccfbf4',
          200: '#99f6ea',
          300: '#5feadc',
          400: '#2dd4c8',
          500: '#17b8ad',
          600: '#0d948c',
          700: '#0f766f',
          800: '#115e5a',
          900: '#134e4a',
        },
        // Secondary – Sage
        lavender: {
          50: '#f4f7f6',
          100: '#e6edea',
          200: '#d0ddd8',
          300: '#afc4bc',
          400: '#87a79c',
          500: '#688b80',
          600: '#527167',
          700: '#445c54',
          800: '#394c46',
          900: '#31413c',
        },
        // Accent – Warm Amber
        coral: {
          50: '#fefaf0',
          100: '#fcf2d6',
          200: '#f9e2ac',
          300: '#f4cc77',
          400: '#efb244',
          500: '#e99a24',
          600: '#d07918',
          700: '#ad5a16',
          800: '#8d4619',
          900: '#743b19',
        },
        // Neutral – Cool Gray
        cream: {
          50: '#fafaf9',
          100: '#f5f5f3',
          200: '#ecece8',
          300: '#deded8',
          400: '#cccbc4',
          500: '#b5b3ab',
          600: '#9d9b92',
          700: '#84827a',
          800: '#6d6b65',
          900: '#5a5955',
        },
        // Background – Off White
        warm: {
          50: '#fbfcfb',
          100: '#f7f9f7',
          200: '#f1f4f1',
          300: '#e9ece9',
          400: '#dfe3df',
          500: '#d2d6d3',
          600: '#c2c7c3',
        },
        // Admin neutral palette
        admin: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(23, 184, 173, 0.07), 0 4px 6px -4px rgba(23, 184, 173, 0.03)',
        'soft-lg': '0 10px 40px -10px rgba(23, 184, 173, 0.10), 0 4px 12px -4px rgba(23, 184, 173, 0.05)',
        'glow': '0 0 30px rgba(23, 184, 173, 0.12)',
        'glow-lavender': '0 0 30px rgba(104, 139, 128, 0.12)',
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      transitionTimingFunction: {
        'ease-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
};
