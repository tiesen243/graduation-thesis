import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@rozumari/ui/components/dropdown-menu'
import {
  CheckIcon,
  LaptopIcon,
  MoonIcon,
  SunIcon,
  SunMoonIcon,
} from '@rozumari/ui/components/icons'
import { useTheme } from 'next-themes'

const THEMES = ['light', 'dark', 'system'] as const
const THEME_ICONS = {
  dark: MoonIcon,
  light: SunIcon,
  system: LaptopIcon,
} as const

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <SunMoonIcon /> Appearance
      </DropdownMenuSubTrigger>

      <DropdownMenuPortal>
        <DropdownMenuSubContent className='min-w-42'>
          {THEMES.map((t) => {
            const Icon = THEME_ICONS[t]

            return (
              <DropdownMenuItem key={t} onClick={() => setTheme(t)}>
                <Icon /> {t.charAt(0).toUpperCase() + t.slice(1)} Theme
                {theme === t && <CheckIcon className='ml-auto' />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
