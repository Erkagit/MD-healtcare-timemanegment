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
        // Primary – Blush Rose (from public site)
        blush: {
          50: '#fef7f7',
          100: '#fdeef0',
          200: '#fcd5db',
          300: '#f9b0bc',
          400: '#f48295',
          500: '#ea5672',
          600: '#d6355a',
          700: '#b42749',
          800: '#962341',
          900: '#80213d',
        },
        // Secondary – Lavender
        lavender: {
          50: '#f8f6fc',
          100: '#f0ecf9',
          200: '#e3dbf4',
          300: '#cec0eb',
          400: '#b49dde',
          500: '#9a7bcf',
          600: '#845fbe',
          700: '#724ea8',
          800: '#60428c',
          900: '#503873',
        },
        // Accent – Soft Coral
        coral: {
          50: '#fff5f3',
          100: '#ffe9e4',
          200: '#ffd6cd',
          300: '#ffb8a8',
          400: '#ff8f74',
          500: '#f86847',
          600: '#e54d29',
          700: '#c13d1e',
          800: '#9f351d',
          900: '#84311e',
        },
        // Warm Neutrals
        cream: {
          50: '#fdfcfa',
          100: '#faf7f2',
          200: '#f5efe5',
          300: '#ede3d2',
          400: '#e2d1b8',
          500: '#d4ba9a',
          600: '#c5a17c',
          700: '#b08762',
          800: '#926e51',
          900: '#785c45',
        },
        // Warm White / Beige
        warm: {
          50: '#fefdfb',
          100: '#fdfaf5',
          200: '#faf5ec',
          300: '#f5ecdc',
          400: '#eeddc5',
          500: '#e5cba9',
          600: '#d9b588',
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
        'soft': '0 2px 15px -3px rgba(234, 86, 114, 0.08), 0 4px 6px -4px rgba(234, 86, 114, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(234, 86, 114, 0.12), 0 4px 12px -4px rgba(234, 86, 114, 0.06)',
        'glow': '0 0 30px rgba(234, 86, 114, 0.15)',
        'glow-lavender': '0 0 30px rgba(154, 123, 207, 0.15)',
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
