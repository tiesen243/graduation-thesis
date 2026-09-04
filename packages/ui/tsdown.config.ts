import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/lib/*.tsx',
    'src/components/*.tsx',
    'src/hooks/*.tsx',
    'src/native/*.tsx',
  ],
  copy: ['src/tailwind.css'],
  deps: { neverBundle: ['react', 'react-native'] },
  dts: true,
  minify: true,
  shims: true,
})
