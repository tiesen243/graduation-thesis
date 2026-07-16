import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/server.ts', 'src/modules/*/application/dto/*.ts'],
  deps: { neverBundle: ['typebox'] },
  dts: true,
  minify: true,
  shims: true,
})
