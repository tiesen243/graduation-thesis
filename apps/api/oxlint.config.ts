import core, { restrictedEnvVars } from '@rozumari/oxlint/core'
import effect from '@rozumari/oxlint/effect'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [core, effect, restrictedEnvVars],
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
