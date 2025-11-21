// Flat ESLint config for IntakeLegal monorepo (Next.js 14 + TypeScript + Node/Express)
// Keep rules minimal to avoid noise; extend incrementally.
import js from '@eslint/js';
import ts from 'typescript-eslint';
import nextPlugin from 'eslint-plugin-next';

export default [
  // Base JS recommendations
  js.configs.recommended,
  // TypeScript recommended (type-aware for .ts/.tsx)
  ...ts.configs.recommended,
  // Next.js core web vitals rules for web/* only
  {
    files: ['web/**/*.{ts,tsx}'],
    plugins: { next: nextPlugin },
    rules: {
      'next/core-web-vitals': 'warn'
    }
  },
  // Node/Express server rules (no browser globals)
  {
    files: ['server/**/*.{ts,tsx,js}'],
    languageOptions: {
      sourceType: 'module'
    },
    rules: {
      'no-console': 'off'
    }
  },
  // Shared package
  {
    files: ['shared/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  // Ignore generated/build artifacts
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/uploads/**',
      '**/node_modules/**'
    ]
  }
];