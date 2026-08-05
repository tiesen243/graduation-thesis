import core from '@rozumari/oxlint/core'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [core],
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        'eslint/no-underscore-dangle': 'off',

        'typescript/no-extraneous-class': 'off',
        'typescript/parameter-properties': 'off',

        'unicorn/no-static-only-class': 'off',
      },
    },

    {
      files: ['**/*.repository.ts'],
      rules: {
        'typescript/no-empty-interface': 'off',
        'typescript/no-empty-object-type': 'off',
      },
    },
  ],
})
