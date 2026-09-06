import { ChevronRightIcon } from '@rozumari/ui/components/icons'
import { Link, useLocation } from 'react-router'

const isCuid2 = (segment: string): boolean => /^[a-z0-9]{24,32}$/u.test(segment)

const formatLabel = (segment: string): string => {
  if (isCuid2(segment) || /\d/u.test(segment)) return segment

  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const Breadcrumbs: React.FC = () => {
  const { pathname } = useLocation()
  const [_, ...pathnames] = pathname.split('/').filter(Boolean)

  return (
    <nav aria-label='Breadcrumb' className='flex items-center text-sm'>
      <ol className='flex items-center space-x-2'>
        <li className='inline-flex items-center gap-1'>
          <Link to='/dashboard'>Dashboard</Link>
        </li>

        {pathnames.map((value, index) => {
          const to = `/dashboard/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1
          const label = formatLabel(value)

          return (
            <li key={to} className='inline-flex items-center gap-1'>
              <ChevronRightIcon className='size-4 shrink-0' />

              {isLast ? (
                <span
                  className='cursor-default font-semibold'
                  aria-current='page'
                >
                  {label}
                </span>
              ) : (
                <Link to={to}>{label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
