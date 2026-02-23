/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
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
        // Secondary – Sage (calm medical green-gray)
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
        'soft': '0 2px 15px -3px rgba(23, 184, 173, 0.07), 0 4px 6px -4px rgba(23, 184, 173, 0.03)',
        'soft-lg': '0 10px 40px -10px rgba(23, 184, 173, 0.10), 0 4px 12px -4px rgba(23, 184, 173, 0.05)',
        'soft-xl': '0 20px 60px -15px rgba(23, 184, 173, 0.12), 0 8px 20px -8px rgba(23, 184, 173, 0.06)',
        'glow': '0 0 30px rgba(23, 184, 173, 0.12)',
        'glow-lavender': '0 0 30px rgba(104, 139, 128, 0.12)',
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
