import globals from 'globals';
import eslintJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

// ----------------------------------------------------------------------

/**
 * @rules common
 * from the reference configuration, tailored for a backend Elysia TypeScript project
 */
const commonRules = () => ({
  'func-names': 1,
  'no-bitwise': 2,
  'no-unused-vars': 0,
  'object-shorthand': 1,
  'no-useless-rename': 1,
  'default-case-last': 2,
  'consistent-return': 2,
  'no-constant-condition': 1,
  'arrow-body-style': [2, 'as-needed', { requireReturnForObjectLiteral: false }],

  // typescript
  '@typescript-eslint/no-shadow': 2,
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-empty-object-type': 0,
  '@typescript-eslint/consistent-type-imports': 1,
  '@typescript-eslint/no-unused-vars': [1, { args: 'none', varsIgnorePattern: '^_' }],
});

/**
 * @rules import
 * from 'eslint-plugin-import'.
 */
const importRules = () => ({
  ...importPlugin.configs.recommended.rules,
  'import/named': 0,
  'import/export': 0,
  'import/default': 0,
  'import/namespace': 0,
  'import/no-named-as-default': 0,
  'import/newline-after-import': 2,
  'import/no-named-as-default-member': 0,
  'import/no-cycle': [
    0, // disabled if slow
    { maxDepth: '∞', ignoreExternal: false, allowUnsafeDynamicCyclicDependency: false },
  ],
});

/**
 * @rules unused imports
 * from 'eslint-plugin-unused-imports'.
 */
const unusedImportsRules = () => ({
  'unused-imports/no-unused-imports': 1,
  'unused-imports/no-unused-vars': [
    0,
    { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
  ],
});

/**
 * @rules sort of imports/exports
 * from 'eslint-plugin-perfectionist'.
 */
const sortImportsRules = () => ({
  'perfectionist/sort-named-imports': [1, { type: 'line-length', order: 'asc' }],
  'perfectionist/sort-named-exports': [1, { type: 'line-length', order: 'asc' }],
  'perfectionist/sort-exports': [
    1,
    {
      order: 'asc',
      type: 'line-length',
    },
  ],
  'perfectionist/sort-imports': [
    2,
    {
      order: 'asc',
      ignoreCase: true,
      type: 'line-length',
      environment: 'node',
      maxLineLength: undefined,
      newlinesBetween: 1,
      internalPattern: ['^src/.+'],
      groups: [
        'style',
        'side-effect',
        'type',
        ['builtin', 'external'],
        'internal',
        ['parent', 'sibling', 'index'],
        'unknown',
      ],
    },
  ],
});

// ----------------------------------------------------------------------

export default tseslint.config(
  // 1. Ignore folders/files that shouldn't be linted
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'drizzle.config.ts',
      'scripts/**',
      'src/api/base/_root.ts',
    ],
  },
  // 2. Global environment configuration (Node.js & Browser globals)
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  // 3. Recommended configurations
  eslintJs.configs.recommended,
  ...tseslint.configs.recommended,
  // 4. Custom plugins and rules
  {
    plugins: {
      'unused-imports': unusedImportsPlugin,
      perfectionist: perfectionistPlugin,
      import: importPlugin,
    },
    settings: {
      ...importPlugin.configs.typescript.settings,
      'import/resolver': {
        ...importPlugin.configs.typescript.settings['import/resolver'],
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      ...commonRules(),
      ...importRules(),
      ...unusedImportsRules(),
      ...sortImportsRules(),
    },
  },
  // 5. Prettier integration (turns off formatting conflicts)
  eslintConfigPrettier,
);
