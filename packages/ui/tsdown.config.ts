import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/lib/*.tsx',
    'src/components/*.tsx',
    'src/hooks/*.ts',
    'src/native/*.tsx',
  ],
  copy: ['src/tailwind.css'],
  outputOptions: {
    preserveModules: true,
  },
  dts: true,
  minify: true,
  shims: true,
})
