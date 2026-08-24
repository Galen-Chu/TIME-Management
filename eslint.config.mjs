// ESLint(扁平設定)。
// 核心規則:NFR-6 —— JSX 內禁止直接書寫 CJK 文字(必須走 i18n key),
// 以及常見字串寫死防制。types/值域邏輯另由 tsc strict 把關。
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXText[value=/[\\u4e00-\\u9fff]/]',
          message: 'NFR-6:JSX 內禁止直接書寫中文——所有 UI 字串必須走 i18n key(t("..."))。',
        },
        {
          selector: "JSXAttribute[name.name='accessibilityLabel'] > Literal[value=/[\\u4e00-\\u9fff]/]",
          message: 'NFR-6:accessibilityLabel 不得寫死中文,請使用 t()。',
        },
      ],
    },
  },
  {
    ignores: ['node_modules/', 'src/i18n/locales/**'],
  },
];
