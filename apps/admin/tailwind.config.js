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
      // Admin-specific overrides (if needed)
    },
  },
};
