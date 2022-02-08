module.exports = {
  ...require('config/eslint-preset'),
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
  extends: ['oclif', 'oclif-typescript'],
}
