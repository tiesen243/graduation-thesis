import type { AccountProvider } from '@rozumari/contract/auth/schemas/account.schema'

import {
  FacebookIcon,
  GithubIcon,
  GoogleIcon,
  TwitterIcon,
} from '@rozumari/ui/components/icons'

export const SUPPORTED_PROVIDERS = [
  { id: 'facebook', name: 'Facebook', Icon: FacebookIcon },
  { id: 'github', name: 'GitHub', Icon: GithubIcon },
  { id: 'google', name: 'Google', Icon: GoogleIcon },
  { id: 'twitter', name: 'Twitter / X', Icon: TwitterIcon },
] as never as readonly {
  id: AccountProvider
  name: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}[]
