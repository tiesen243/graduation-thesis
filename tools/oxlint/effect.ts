import { defineConfig } from 'oxlint'

export default defineConfig({
  rules: {
    'typescript/no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['effect$', 'effect/unstable/*'],
            message:
              "Please use namespace imports (e.g., import * as Effect from 'effect') instead of named imports.",
          },
        ],
      },
    ],
  },
})
