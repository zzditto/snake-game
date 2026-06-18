module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['src/game/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [{
            group: ['vue', 'pinia', 'vue-router', '@/stores/*', '@/components/*', '@/views/*'],
            message: 'src/game/** must not depend on Vue/Pinia/Router.',
          }],
        }],
      },
    },
    {
      files: ['src/views/**/*.vue', 'src/views/**/*.ts', 'src/components/**/*.vue', 'src/components/**/*.ts', 'src/stores/**/*.ts', 'tests/**/*.ts'],
      rules: { 'no-restricted-imports': 'off' },
    },
  ],
};
