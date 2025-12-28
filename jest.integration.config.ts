import type { Config } from 'jest';

const integrationConfig: Config = {
  clearMocks: true,
  resetMocks: true,
  resetModules: true,
  cache: false,
  testEnvironment: 'node',
  rootDir: './src',
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Run tests sequentially - integration tests share the same database
  maxWorkers: 1,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
      },
    ],
  },
  testMatch: ['**/*.integration.test.ts'],
  testTimeout: 30000,
};

export default integrationConfig;
