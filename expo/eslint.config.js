const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["dist/*"],
  }
]);
