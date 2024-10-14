/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
// @ts-expect-error i dont know how to fix it yet
import eslintJest from 'eslint-plugin-jest';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*/*.spec.ts', '**/*/*.spec.ts'],
    plugins: { eslintJest },
  },
  {
    files: ['**/*/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  }
);
