// 層の依存方向:
//
//   presentation  →  application  →  domain
//                         ↓             ↑
//                   infrastructure ─────┘
//
// domain 層は何にも依存しない。infrastructure 層は domain 層が定義した
// インターフェースを実装する（依存性逆転）。presentation 層はドメインオブジェクトを
// 直接触らず、application 層が返す DTO だけを扱う。
//
// この方向を README の願望で終わらせず、import/no-restricted-paths で機械的に固定する。
// src/main.tsx は composition root なのでゾーンの外に置き、全層を組み立てられるようにしている。
const layerBoundaries = {
	zones: [
		// domain 層は他のどの層にも依存しない
		{ target: './src/domain', from: './src/application' },
		{ target: './src/domain', from: './src/infrastructure' },
		{ target: './src/domain', from: './src/presentation' },

		// application 層が依存してよいのは domain 層だけ
		{ target: './src/application', from: './src/infrastructure' },
		{ target: './src/application', from: './src/presentation' },

		// infrastructure 層は domain 層のインターフェースを実装するだけ
		{ target: './src/infrastructure', from: './src/application' },
		{ target: './src/infrastructure', from: './src/presentation' },

		// presentation 層は application 層の DTO 越しにしかドメインを知らない
		{ target: './src/presentation', from: './src/domain' },
		{ target: './src/presentation', from: './src/infrastructure' },
	],
}

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
	settings: {
		react: { version: '18.2' },
		'import/resolver': { typescript: true },
	},
	// import プラグインは層境界のルール (import/no-restricted-paths) のためだけに使う。
	// 推奨セットは React の型定義と噛み合わず誤検出するうえ、モジュール解決の検査は
	// TypeScript が担っているため有効にしない。
	plugins: ['@typescript-eslint', 'react-refresh', 'import'],
	overrides: [
		{
			// テストファイルでは Vitest のグローバル (vite.config.ts の test.globals) を許可する
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
		{
			// domain 層は外の世界を一切知らない。
			// 外部が必要になったら、それはインターフェースとして domain 層に定義し、
			// 実装を infrastructure 層に置く。
			files: ['src/domain/**/*.ts'],
			rules: {
				'no-restricted-imports': [
					'error',
					{
						paths: [
							{ name: 'react', message: 'domain 層は UI フレームワークに依存できません。' },
							{ name: 'react-dom', message: 'domain 層は UI フレームワークに依存できません。' },
							{ name: 'nanoid', message: 'ID 生成は infrastructure 層の責務です。domain 層にはインターフェースを置いてください。' },
						],
						patterns: [
							{
								group: ['react*', 'react-dom/*'],
								message: 'domain 層は UI フレームワークに依存できません。',
							},
						],
					},
				],
			},
		},
	],
	rules: {
		'import/no-restricted-paths': ['error', layerBoundaries],
		"react/jsx-first-prop-new-line": [1, "multiline"],
		'react/prop-types': 'off',
		'react-refresh/only-export-components': [
			'warn',
			{ allowConstantExport: true },
		],
	},
}
