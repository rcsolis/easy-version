module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: ['standard', 'prettier'],
    overrides: [],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        quotes: ['error', 'single'],
        indent: ['error', 4],
        'no-tabs': ['error', { allowIndentationTabs: true }],
        'comma-dangle': ['error', 'always-multiline'],
        semi: ['error', 'always'],
        'space-before-blocks': ['error', { functions: 'always', keywords: 'always', classes: 'always' }],
    },
};
