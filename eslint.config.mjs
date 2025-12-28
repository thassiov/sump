import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      '**/*.mjs',
      '**/*.js',
      // Ignore test files (not in tsconfig, tested separately)
      '**/*.spec.ts',
      '**/*.test.ts',
      'jest.*.ts',
      'src/test/**',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      // Off - handled by TypeScript compiler
      '@typescript-eslint/consistent-type-definitions': 'off',

      // Off - too noisy with Knex and dynamic data
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/unbound-method': 'off',

      // Off - explicit any is sometimes needed
      '@typescript-eslint/no-explicit-any': 'off',

      // Warn instead of error for style preferences
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/array-type': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // Off - template literal flexibility
      '@typescript-eslint/restrict-template-expressions': 'off',

      // Off - NestJS uses classes with static properties
      '@typescript-eslint/no-extraneous-class': 'off',

      // Off - sometimes conditions are needed for type narrowing
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  }
);
