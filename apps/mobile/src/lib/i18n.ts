// oxlint-disable-next-line unicorn/prefer-export-from
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { getLanguage } from '@/lib/secure-store'

// English
import enAuth from '../../assets/locales/en/auth.json' with { type: 'json' }
import enCommon from '../../assets/locales/en/common.json' with { type: 'json' }
import enHome from '../../assets/locales/en/home.json' with { type: 'json' }
import enNotification from '../../assets/locales/en/notification.json' with { type: 'json' }
import enPillBox from '../../assets/locales/en/pill-box.json' with { type: 'json' }
import enProfile from '../../assets/locales/en/profile.json' with { type: 'json' }
import enSchedule from '../../assets/locales/en/schedule.json' with { type: 'json' }
import viAuth from '../../assets/locales/vi/auth.json' with { type: 'json' }
// Vietnamese
import viCommon from '../../assets/locales/vi/common.json' with { type: 'json' }
import viHome from '../../assets/locales/vi/home.json' with { type: 'json' }
import viNotification from '../../assets/locales/vi/notification.json' with { type: 'json' }
import viPillBox from '../../assets/locales/vi/pill-box.json' with { type: 'json' }
import viProfile from '../../assets/locales/vi/profile.json' with { type: 'json' }
import viSchedule from '../../assets/locales/vi/schedule.json' with { type: 'json' }

export const supportedLanguages = ['en', 'vi'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    home: enHome,
    pillBox: enPillBox,
    schedule: enSchedule,
    notification: enNotification,
    profile: enProfile,
  },
  vi: {
    common: viCommon,
    auth: viAuth,
    home: viHome,
    pillBox: viPillBox,
    schedule: viSchedule,
    notification: viNotification,
    profile: viProfile,
  },
}

async function initializeI18n() {
  const language = await getLanguage()

  // oxlint-disable-next-line import/no-named-as-default-member
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,

    lng: language,
    fallbackLng: 'en',

    ns: [
      'common',
      'auth',
      'home',
      'pillBox',
      'schedule',
      'notification',
      'profile',
    ],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })
}

initializeI18n()
export { i18n }

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: (typeof resources)['en']
  }
}
