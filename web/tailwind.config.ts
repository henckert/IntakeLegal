import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Inter', 'Verdana', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // IntakeLegal brand system
        brand: {
          primary: '#138E9D',
          primaryBright: '#2DB1BB',
          primaryDark: '#246871',
          accentYellow: '#F9C051',
          accentYellow2: '#F7B43C',
          backgroundSoft: '#F0F7F8',
          borderSoft: '#A0BDB9',
          textMain: '#1A1F2C',
          textMuted: '#6B7C82',
        },
        
        // Legacy token aliases (for gradual migration)
        primary: {
          DEFAULT: '#138E9D',
          light: '#2DB1BB',
          dark: '#246871',
        },
        accent: {
          DEFAULT: '#F9C051',
          light: '#F9B233',
          dark: '#E09615',
        },
        background: '#F0F7F8',
        surface: '#FFFFFF',
        'text-main': '#1A1F2C',
        'text-muted': '#6B7C82',
        border: '#A0BDB9',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
        
        // Old colors (keep for compatibility)
        secondary: '#13315C',
        accent1: '#00A9A5',
        accent2: '#F7C948',
        'text-primary': '#101820',
        'text-secondary': '#5E6C84',
      },
      borderRadius: {
        '2xl': '1rem',
        'xl': '0.75rem',
      },
      boxShadow: {
        card: '0 4px 14px rgba(0,0,0,0.08)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #138E9D 0%, #2DB1BB 100%)',
        'accent-gradient': 'linear-gradient(90deg, #F9C051 0%, #F7B43C 100%)',
        'hero-gradient': 'linear-gradient(135deg, #138E9D 0%, #2DB1BB 50%, #246871 100%)',
      },
    },
  },
  plugins: [],
};

export default config;

