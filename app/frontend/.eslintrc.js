module.exports = {
    'env': {
        'browser': true,
        'es2021': true
    },
    'extends': [
        "prettier",
        // 'eslint:recommended',
        // 'plugin:@typescript-eslint/recommended',
        // "plugin:prettier/recommended",
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 12,
        'sourceType': 'module'
    },
    'plugins': [
        '@typescript-eslint'
    ],
    'rules': {
        'indent': [
            'error',
            4
        ],
    }
};
