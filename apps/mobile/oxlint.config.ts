import core, { restrictedEnvVars } from '@rozumari/oxlint/core'
import effect from '@rozumari/oxlint/effect'
import react from '@rozumari/oxlint/react'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [core, effect, react, restrictedEnvVars],
  ignorePatterns: ['uniwind-types.d.ts'],
})
