import type { Config } from 'jest';

const unitConfig: Config = {
  clearMocks: true,
  resetMocks: true,
  resetModules: true,
  cache: false,
  testEnvironment: 'node',
  rootDir: './src',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
      },
    ],
  },
  testMatch: ['**/*.spec.ts'],
  testTimeout: 10000,
};

export default unitConfig;
