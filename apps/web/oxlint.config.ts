import core, { restrictedEnvVars } from '@rozumari/oxlint/core'
import react from '@rozumari/oxlint/react'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [core, react, restrictedEnvVars],
})
