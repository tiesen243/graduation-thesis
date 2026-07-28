import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/api.ts', 'src/main.ts'],
  dts: true,
  minify: true,
  shims: true,
})
