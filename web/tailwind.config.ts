import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B2545',
        secondary: '#13315C',
        accent1: '#00A9A5',
        accent2: '#F7C948',
        background: '#F5F7FA',
        'text-primary': '#101820',
        'text-secondary': '#5E6C84',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 4px 14px rgba(0,0,0,0.08)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0B2545 0%, #13315C 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
