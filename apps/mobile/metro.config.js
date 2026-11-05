// oxlint-disable unicorn/prefer-module

// const path = require('node:path')
//
// const { getDefaultConfig } = require('expo/metro-config')
// const { withUniwindConfig } = require('uniwind/metro')

import { getDefaultConfig } from 'expo/metro-config'
import path from 'node:path'
import { withUniwindConfig } from 'uniwind/metro'

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../../')

const config = getDefaultConfig(projectRoot)

// your metro modifications
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// oxlint-disable-next-line require-unicode-regexp
const conformRegex = /\/\.conform\..*/
if (Array.isArray(config.resolver.blockList))
  config.resolver.blockList.push(conformRegex)
else if (config.resolver.blockList)
  config.resolver.blockList = [config.resolver.blockList, conformRegex]
else config.resolver.blockList = [conformRegex]

export default withUniwindConfig(config, {
  cssEntryFile: './src/globals.css',
  dtsFile: './src/uniwind-types.d.ts',
})
