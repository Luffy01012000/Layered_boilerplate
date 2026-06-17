import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import prettierPlugin from 'eslint-plugin-prettier'

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**', 'src/shared/generated/**']
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'prettier': prettierPlugin
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'prettier/prettier': ['warn', { endOfLine: 'lf' }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      // 'comma-dangle': ['warn', 'always-multiline'],
      'comma-dangle': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  }
])

// // @ts-check

// import eslint from '@eslint/js'
// import tseslint from 'typescript-eslint'
// import eslintConfigPrettier from 'eslint-config-prettier'

// export default tseslint.config({
//   languageOptions: {
//     parserOptions: {
//       project: true,
//       tsconfigRootDir: import.meta.dirname
//     }
//   },
//   files: ['src/**/*.ts'],
//   extends: [eslint.configs.recommended, ...tseslint.configs.recommendedTypeChecked, eslintConfigPrettier],
//   rules: {
//     'no-console': 'error',
//     'no-useless-catch': 0,
//     quotes: ['error', 'single', { allowTemplateLiterals: true }]
//   }
// })
