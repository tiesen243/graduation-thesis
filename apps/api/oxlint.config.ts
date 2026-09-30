import core, { restrictedEnvVars } from '@rozumari/oxlint/core'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [core, restrictedEnvVars],
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        'typescript/no-extraneous-class': 'off',
        'typescript/parameter-properties': 'off',
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
