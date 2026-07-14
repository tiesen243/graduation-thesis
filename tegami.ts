#!/usr/bin/env bun

import { PublishPlan, tegami } from 'tegami'
import { runCli } from 'tegami/cli'
import { github } from 'tegami/plugins/github'

const paper = tegami({
  npm: {
    client: 'bun',
    updateLockFile: true,
  },

  plugins: [
    github({
      repo: 'tiesen243/graduation-thesis',
      versionPr: { base: 'dev' },
    }),
  ],

  ignore: ['docs'],
})

await runCli(paper, {
  publish: () => paper.publish({ dryRun: true }) as Promise<PublishPlan>,
})
