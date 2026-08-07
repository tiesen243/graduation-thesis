import { defineConfig } from 'oxfmt'

export default defineConfig({
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  endOfLine: 'lf',
  proseWrap: 'never',

  singleQuote: true,
  jsxSingleQuote: true,
  quoteProps: 'as-needed',

  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  trailingComma: 'es5',

  sortImports: {
    groups: [
      'side_effect_style',
      'type-import',
      ['value-builtin', 'value-external'],
      'type-internal',
      'value-internal',
      ['type-parent', 'type-sibling', 'type-index'],
      ['value-parent', 'value-sibling', 'value-index'],
    ],
    ignoreCase: true,
    newlinesBetween: true,
    order: 'asc',
  },

  sortPackageJson: {
    sortScripts: true,
  },

  sortTailwindcss: {
    functions: ['clsx', 'cva', 'cn'],
    stylesheet: './packages/ui/src/tailwind.css',
  },
})
