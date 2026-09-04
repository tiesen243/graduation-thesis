import type { ConfigContext, ExpoConfig } from 'expo/config'

import * as pkgJson from './package.json' with { type: 'json' }

const appName = pkgJson.name.match(/^@(?<name>[^/]+)\//u)?.at(1) ?? 'mobile'

// oxlint-disable-next-line unicorn/no-anonymous-default-export
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName.charAt(0).toUpperCase() + appName.slice(1),
  slug: appName,
  scheme: appName,
  version: pkgJson.version,
  orientation: 'portrait',
  icon: './assets/icon-light.png',
  userInterfaceStyle: 'automatic',
  updates: {
    fallbackToCacheTimeout: 0,
  },

  android: {
    package: `com.${appName}.mobile`,
    adaptiveIcon: {
      foregroundImage: './assets/icon-light.png',
      backgroundColor: '#000000',
    },
  },

  ios: {
    bundleIdentifier: `com.${appName}.mobile`,
    supportsTablet: true,
  },

  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
    reactCompiler: true,
  },

  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FAFAFA',
        image: './assets/icon-light.png',
        dark: {
          backgroundColor: '#000000',
          image: './assets/icon-dark.png',
        },
      },
    ],
  ],
})
