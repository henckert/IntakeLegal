/**
 * IntakeLegal Brand Assets & Colors
 * 
 * Central source of truth for brand identity.
 * All logo variants, colors, and asset paths defined here.
 */

export const BRAND = {
  // Logo assets
  mark: '/brand/intakelegal-mark.svg',
  wordmark: '/brand/intakelegal-wordmark.svg',
  
  // Brand colors (extracted from logo)
  teal: '#0BA5A4',        // Primary teal (background)
  tealLight: '#0CB5B4',   // Lighter teal
  tealDark: '#099190',    // Darker teal
  gold: '#F5A623',        // Logo mark golden/orange (outer)
  goldLight: '#F9B233',   // Lighter gold
  goldDark: '#E09615',    // Darker gold
  white: '#FFFFFF',       // Wordmark color
  
  // Logo dimensions (for consistent sizing)
  logoHeight: {
    header: 32,           // Navigation bar height in px
    hero: 48,             // Hero section height in px
    footer: 28,           // Footer height in px
  },
  
  // Favicon paths
  favicon: {
    svg: '/favicon.svg',
    ico: '/favicon.ico',
  },
} as const;

export type BrandAssets = typeof BRAND;
