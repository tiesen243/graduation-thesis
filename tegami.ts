import { tegami } from 'tegami'
import { createCli } from 'tegami/cli'
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

void createCli(paper).parseAsync()
