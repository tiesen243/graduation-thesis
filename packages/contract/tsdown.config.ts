import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/*/middleware.ts', 'src/*/{schemas,dto}/*.ts'],
  dts: true,
  minify: true,
  shims: true,
  outputOptions: {
    chunkFileNames: '_internal/[name]-[hash].mjs',
  },
})
