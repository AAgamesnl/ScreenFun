import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  // Global ignores
  {
    ignores: [
      'dist/',
      'dist/**',
      'node_modules/',
      'coverage/',
      'build/',
      'public/libs/',
      'public/**/*.js' // Ignore compiled JS files
    ]
  },
  // Main config
  {
    ...js.configs.recommended,
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        module: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        NodeJS: 'readonly',
        
        // Browser globals  
        window: 'readonly',
        document: 'readonly',
        location: 'readonly',
        URLSearchParams: 'readonly',
        HTMLElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        getComputedStyle: 'readonly',
        requestAnimationFrame: 'readonly',
        
        // Socket.IO global
        io: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'eqeqeq': ['error', 'smart'],
      'no-unused-vars': 'off'
    }
  }
];