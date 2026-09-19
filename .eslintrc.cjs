module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	parser: '@typescript-eslint/parser',
	parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'plugin:react-hooks/recommended',
	],
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	settings: { react: { version: '18.2' } },
	plugins: ['@typescript-eslint', 'react-refresh'],
	// テストファイルでは Vitest のグローバル (vite.config.ts の test.globals) を許可する
	overrides: [
		{
			files: ['**/*.test.{ts,tsx}', 'src/setupTests.ts'],
			globals: {
				describe: 'readonly',
				it: 'readonly',
				test: 'readonly',
				expect: 'readonly',
				vi: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
			},
		},
	],
	rules: {
		"react/jsx-first-prop-new-line": [1, "multiline"],
		'react/prop-types': 'off',
		'react-refresh/only-export-components': [
			'warn',
			{ allowConstantExport: true },
		],
	},
}
