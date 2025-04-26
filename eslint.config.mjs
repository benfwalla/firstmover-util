import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals"; // Import globals
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js'; // Import react recommended
import tseslint from 'typescript-eslint'; // Import typescript-eslint

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Base Next.js configurations
const baseConfig = [
  ...compat.extends("next/core-web-vitals", "plugin:@typescript-eslint/recommended"), // Use TS recommended directly
];

// Custom rules configuration
const customRulesConfig = {
  files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], // Apply to all relevant files
  languageOptions: {
    globals: {
      ...globals.browser, // Add browser globals
      ...globals.node, // Add node globals
      React: "readonly" // Define React global
    },
    parserOptions: {
      ecmaFeatures: {
        jsx: true, // Enable JSX parsing
      },
    }
  },
  plugins: { // Ensure plugins are defined if rules use them
    '@typescript-eslint': tseslint.plugin,
    // Assuming react-hooks is implicitly available via next/core-web-vitals or manually install eslint-plugin-react-hooks
    // 'react-hooks': pluginReactHooks, 
  },
  rules: {
    // Enforce exhaustive deps, but treat it as a warning
    "react-hooks/exhaustive-deps": "warn",
    // Allow unused vars prefixed with _, treat others as errors
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],
    // Add other custom rules or overrides here if needed
  }
};

// Combine configurations
const eslintConfig = [
  ...baseConfig,
  customRulesConfig, // Add our custom rules
];

export default eslintConfig;
