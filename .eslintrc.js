module.exports = {
  env: {
    browser: true,
  },
  extends: [
    'airbnb',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',
    'no-param-reassign': 'off',
  },
};
