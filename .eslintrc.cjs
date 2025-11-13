module.exports = {
  root: true,
  env: { node: true, es2022: true, browser: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended'
  ],
  settings: { react: { version: 'detect' } },
  ignorePatterns: ['dist', 'build', 'node_modules', '.next'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off'
  },
  overrides: [
    {
      files: ['server/src/**/*.ts'],
      rules: {
        // Disallow direct Prisma client imports/usage in server code; require tenantDb wrapper
        'no-restricted-imports': [
          'error',
          {
            paths: [
              { name: '@prisma/client', message: 'Use tenantDb(firmId) from server/src/services/tenantDb.ts instead of importing PrismaClient.' },
              { name: '../prisma/client', message: 'Use tenantDb(firmId); do not import getPrisma() directly outside prisma helpers.' },
              { name: '../prisma/client.js', message: 'Use tenantDb(firmId); do not import getPrisma() directly outside prisma helpers.' }
            ]
          }
        ]
      }
    },
    {
      files: ['server/src/prisma/**', 'server/src/services/tenantDb.ts'],
      rules: {
        // Allow prisma usage within the prisma helper and tenantDb wrapper
        'no-restricted-imports': 'off'
      }
    }
  ]
};
