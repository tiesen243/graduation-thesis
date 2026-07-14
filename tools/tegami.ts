import { tegami } from 'tegami'
import { runCli } from 'tegami/cli'
import { github } from 'tegami/plugins/github'

const paper = tegami({
  plugins: [
    github({
      repo: 'tiesen243/graduation-thesis',
      versionPr: { branch: 'dev' },
    }),
  ],
})

await runCli(paper)
