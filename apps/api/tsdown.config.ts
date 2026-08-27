import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/cli.ts', 'src/bootstrap.ts'],
  deps: { neverBundle: ['bun:test'] },
  dts: true,
  minify: true,
  shims: true,
})
