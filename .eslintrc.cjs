const config = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb-base", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
  },
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      },
    },
  ],
};

module.exports = config;

