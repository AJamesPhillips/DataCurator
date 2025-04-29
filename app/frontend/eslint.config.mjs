// @ts-check

import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
    eslint.configs.recommended,
    // Had to add this as was getting the error "Error while loading rule
    // '@typescript-eslint/no-unnecessary-condition': You have used a rule which
    // requires type information, but don't have parserOptions set to generate
    // type information for this file. See
    // https://typescript-eslint.io/getting-started/typed-linting for enabling
    // linting with type information."
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
            projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            "no-debugger": "warn",
            "@typescript-eslint/no-unnecessary-condition": "error",
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_$" }],
        },
    },
)
