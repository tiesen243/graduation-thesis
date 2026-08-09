import core from '@rozumari/oxlint/core'
import effect from '@rozumari/oxlint/effect'
import react from '@rozumari/oxlint/react'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [core, effect, react],
  overrides: [
    {
      files: ['./src/**/*.tsx'],
      rules: {
        'react/no-unstable-nested-components': [
          'error',
          {
            allowAsProps: true,
          },
        ],
      },
    },
  ],
})
