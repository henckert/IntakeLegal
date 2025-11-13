// Brand theme tokens for IntakeLegal
export const theme = {
  colors: {
    primary: '#0B2545',
    secondary: '#13315C',
    accent1: '#00A9A5',
    accent2: '#F7C948',
    background: '#F5F7FA',
    textPrimary: '#101820',
    textSecondary: '#5E6C84',
  },
  gradient: 'linear-gradient(135deg, #0B2545 0%, #13315C 100%)',
  radius: {
    card: '1rem', // rounded-2xl
  },
  shadows: {
    card: '0 4px 14px rgba(0,0,0,0.08)',
  },
  fonts: {
    ui: 'var(--font-inter), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    heading: 'var(--font-dm-serif), Georgia, Cambria, Times, serif',
  },
} as const;

export type Theme = typeof theme;
