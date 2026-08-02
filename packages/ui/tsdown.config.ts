import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/lib/*.ts', 'src/components/*.tsx', 'src/hooks/*.tsx'],
  copy: ['src/tailwind.css'],
  dts: true,
  minify: true,
  shims: true,
})
