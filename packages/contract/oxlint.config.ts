import core from '@rozumari/oxlint/core'
import effect from '@rozumari/oxlint/effect'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [core, effect],
  overrides: [
    {
      files: ['src/**/*.error.ts'],
      rules: {
        'max-classes-per-file': 'off',
        'unicorn/throw-new-error': 'off',
      },
    },
  ],
})
