import core from '@rozumari/oxlint/core'
import react from '@rozumari/oxlint/react'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [core, react],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'react/jsx-no-literals': 'off',
      },
    },
  ],
})
