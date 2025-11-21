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
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // New v1.0 color palette
        primary: {
          DEFAULT: '#0C3C78',
          light: '#135A9E',
        },
        accent: '#00BFA6',
        background: '#F7FAFC',
        surface: '#FFFFFF',
        'text-main': '#1A1F2C',
        'text-muted': '#6B7280',
        border: '#E5E7EB',
        success: '#16A34A',
        warning: '#FACC15',
        error: '#DC2626',
        // Legacy colors (for backward compatibility)
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
        'brand-gradient': 'linear-gradient(135deg, #0B2545 0%, #13315C 100%)',
        'accent-gradient': 'linear-gradient(90deg, #0C3C78 0%, #135A9E 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
