import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/cli.ts', 'src/bootstrap.ts'],
  dts: true,
  minify: true,
  shims: true,
})
