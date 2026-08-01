import core from '@rozumari/oxlint/core'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [core],
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        'typescript/no-extraneous-class': 'off',
        'typescript/parameter-properties': 'off',

        'unicorn/no-static-only-class': 'off',
      },
    },

    {
      files: ['**/*.error.ts', '**/*.group.ts'],
      rules: {
        'max-classes-per-file': 'off',
      },
    },
  ],
})
