import core from '@rozumari/oxlint/core'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [core],
  overrides: [
    {
      files: ['src/**/*.error.ts'],
      rules: {
        'max-classes-per-file': 'off',
      },
    },
  ],
})
