import core from '@rozumari/oxlint/core'
import effect from '@rozumari/oxlint/effect'
import react from '@rozumari/oxlint/react'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [core, effect, react],
  ignorePatterns: ['uniwind-types.d.ts'],
})
