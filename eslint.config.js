import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importPlugin from 'eslint-plugin-import'

export default [
  { ignores: ['dist', 'node_modules', 'dev-dist', 'docs', 'android', 'scripts', '**/*.min.js'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import': importPlugin,
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['@', './src'],
          ],
          extensions: ['.js', '.jsx'],
        },
        node: {
          extensions: ['.js', '.jsx'],
        },
      },
      'import/cache': {
        lifetime: Infinity,
      },
      'import/ignore': ['node_modules', '^czero(/.*)?$'],
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Import detection rules
      'import/no-unresolved': ['error', { ignore: ['^czero(/.*)?$'] }],  // Detect missing/broken imports (ignore czero library)
      'import/named': 'error',                 // Detect invalid named exports
      'import/default': 'error',               // Detect invalid default exports  
      'import/namespace': 'error',             // Detect invalid namespace imports
      'import/no-duplicates': 'warn',          // Warn on duplicate imports
    },
  },
  // Node.js config files (vite, etc.)
  {
    files: ['vite.config.js', '*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]
