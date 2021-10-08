module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: ['airbnb-base', 'prettier'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        'import/extensions': 0,
        'import/no-unresolved': 0,
    },
    overrides: [
        {
            files: [
                '**/*.test.ts',
                '**/*.spec.ts',
                '**/*.test.js',
                '**/*.spec.js',
            ],
            env: {
                jest: true,
            },
        },
    ],
};
