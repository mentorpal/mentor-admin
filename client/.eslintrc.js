module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  extends: [
    "airbnb-typescript",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  plugins: ["@typescript-eslint", "react"],
  // parserOptions: {
  //   ecmaFeatures: {
  //     jsx: true,
  //   },
  //   ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
  //   sourceType: "module", // Allows for the use of imports
  // },
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "@typescript-eslint/ban-ts-ignore": "off",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-nested-ternary": "off",
    "no-prototype-builtins": "off",
    "no-underscore-dangle": "off", // we should get rid of all the _id's tho!
    "react/display-name": "off",
    "react/prop-types": "off", // Disable prop-types as we use TypeScript for type checking
    "react/no-array-index-key": "off",
  },
  settings: {
    react: {
      version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  overrides: [
    // Override some TypeScript rules just for .js files
    {
      files: ["*.js"],
      rules: {},
    },
  ],
};
