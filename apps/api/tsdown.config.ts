import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/cli.ts', 'src/bootstrap.ts'],
  minify: false,
  shims: true,
})
