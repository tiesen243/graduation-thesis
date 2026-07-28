import core from '@rozumari/oxlint/core'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [core],
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        'max-classes-per-file': ['error', { max: 2 }],

        'typescript/no-extraneous-class': 'off',
        'typescript/parameter-properties': 'off',

        'unicorn/no-static-only-class': 'off',
      },
    },
  ],
})
