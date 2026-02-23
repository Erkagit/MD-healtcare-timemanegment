/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary – Blush Rose
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
      },
      fontFamily: {
        sans: ['var(--font-primary)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-primary)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(234, 86, 114, 0.08), 0 4px 6px -4px rgba(234, 86, 114, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(234, 86, 114, 0.12), 0 4px 12px -4px rgba(234, 86, 114, 0.06)',
        'soft-xl': '0 20px 60px -15px rgba(234, 86, 114, 0.15), 0 8px 20px -8px rgba(234, 86, 114, 0.08)',
        'glow': '0 0 30px rgba(234, 86, 114, 0.15)',
        'glow-lavender': '0 0 30px rgba(154, 123, 207, 0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
