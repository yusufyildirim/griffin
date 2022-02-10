module.exports = {
  ...require('config/eslint-react-native'),
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
}
