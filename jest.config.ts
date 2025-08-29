import type { Config } from 'jest';

const jestConfig: Config = {
  // [...]
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
      },
    ],
  },
};

export default jestConfig;
