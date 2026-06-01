// Manual moduleNameMapper for @/ paths (tsconfig.json has comments, not valid JSON)
const moduleNameMapper = {
  "^@/(.*)$": "<rootDir>/src/$1",
};

/** @type {import("jest").Config} **/
module.exports = {
  maxWorkers: '50%',
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          moduleResolution: "bundler",
          module: "ESNext",
          target: "ES2020",
        },
      },
    ],
  },
  moduleNameMapper,
};