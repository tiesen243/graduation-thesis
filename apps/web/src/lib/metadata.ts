import type { MetaDescriptor } from 'react-router'

import { env } from '@/lib/env'
import { getBaseUrl } from '@/lib/utils'

export interface Metadata {
  title?: string
  description?: string
  openGraph?: {
    images?: { url: string; alt?: string }[]
    url?: string
  }
}

export const createMetadata = (override: Metadata = {}): MetaDescriptor[] => {
  const siteName = env.VITE_APP_NAME
  const baseUrl = getBaseUrl()

  const title = override.title ? `${override.title} | ${siteName}` : siteName
  const description =
    override.description ??
    'Rozumari is a thoughtful technology for everyday care, designed to help families and caregivers manage routines with ease and privacy.'
  const url = override.openGraph?.url
    ? `${baseUrl}${override.openGraph.url}`
    : baseUrl

  return [
    { charSet: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },

    { title },
    { name: 'description', content: description },
    {
      name: 'keywords',
      content: [
        // Brand & Core Product
        'Rozumari',
        'smart pillbox',
        'smart pill organizer',
        'IoT medicine dispenser',
        'automatic pill dispenser',
        'smart medication dispenser',

        // Key Features & Solutions
        'medication reminder app',
        'smart prescription reminder',
        'pill tracking system',
        'medication adherence solution',
        'dose tracking device',

        // Target Audience & Use Cases
        'elderly care technology',
        'remote family health care',
        'caregiver monitoring system',
        'smart care technology',
        'senior health IoT',

        // High-Intent / Long-Tail Search
        'Rozumari smart pillbox',
        'connected health devices for seniors',
        'smart pillbox with app notification',
      ].join(', '),
    },

    // Open Graph Metadata
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:site_name', content: siteName },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: url },
    ...(override.openGraph?.images
      ? override.openGraph.images.map((image) => ({
          property: 'og:image',
          content: image.url,
          alt: image.alt,
        }))
      : []),

    // Twitter Card Metadata
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    ...(override.openGraph?.images && override.openGraph.images.length > 0
      ? [{ name: 'twitter:image', content: override.openGraph.images[0]?.url }]
      : []),

    // Additional Metadata
    { rel: 'canonical', href: url },
    {
      name: 'google-site-verification',
      content: 'IxxbL_t4Uj36PsfajteCHNpV6Ln9fr7WCkxmzFjW_ms',
    },
  ]
}
