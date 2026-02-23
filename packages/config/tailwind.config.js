/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ==========================================
      // MD HEALTH CARE - UNIFIED DESIGN TOKENS
      // ==========================================
      colors: {
        // Brand Primary (Teal - Medical Professional)
        brand: {
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
        // Keep primary as alias for brand
        primary: {
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
        // Accent (Warm Amber - Trust & Warmth)
        accent: {
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
        // Surface colors for backgrounds
        surface: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#f0f0f0',
          300: '#e5e5e5',
        },
        clinic: {
          blue: '#0066cc',
          green: '#00a651',
          gray: '#f5f5f5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'input': '10px',
        'badge': '20px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'nav': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'modal': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'soft': '0 2px 8px -2px rgb(0 0 0 / 0.08)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
