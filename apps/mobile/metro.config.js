// oxlint-disable unicorn/prefer-module

const path = require('node:path')

const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('uniwind/metro')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../../')

const config = getDefaultConfig(projectRoot)
const { assetExts, sourceExts } = config.resolver

// your metro modifications
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

config.transformer.babelTransformerPath =
  require.resolve('react-native-svg-transformer')
config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg')
config.resolver.sourceExts = [...sourceExts, 'svg']

// oxlint-disable-next-line require-unicode-regexp
const conformRegex = /\/\.conform\..*/
if (Array.isArray(config.resolver.blockList))
  config.resolver.blockList.push(conformRegex)
else if (config.resolver.blockList)
  config.resolver.blockList = [config.resolver.blockList, conformRegex]
else config.resolver.blockList = [conformRegex]

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/globals.css',
  dtsFile: './uniwind-types.d.ts',
})
